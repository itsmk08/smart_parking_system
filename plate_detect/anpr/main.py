import cv2
import time
import os
import json
from datetime import datetime
from ultralytics import YOLO
import pytesseract

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = r'C:/Program Files/Tesseract-OCR/tesseract.exe'

sensor_triggered = True

# Step 1: Capture 3 seconds of video
def capture_video(duration=3, save_dir="main_video"):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    save_dir = os.path.join(base_dir, save_dir)
    os.makedirs(save_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    video_filename = f"video_{timestamp}.avi"
    save_path = os.path.join(save_dir, video_filename)

    cap = cv2.VideoCapture(0)
    width = int(cap.get(3))
    height = int(cap.get(4))
    fourcc = cv2.VideoWriter_fourcc(*'XVID')
    out = cv2.VideoWriter(save_path, fourcc, 20.0, (width, height))

    start_time = time.time()
    while time.time() - start_time < duration:
        ret, frame = cap.read()
        if not ret:
            break
        out.write(frame)
        cv2.imshow('Recording...', frame)
        if cv2.waitKey(1) == ord('q'):
            break

    cap.release()
    out.release()
    cv2.destroyAllWindows()

    return save_path

# Step 2: Analyze and annotate best frame with bounding box
def analyze_and_annotate(video_path, yolo_model_path, save_dir="labeled_frame"):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    save_dir = os.path.join(base_dir, save_dir)
    os.makedirs(save_dir, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    model = YOLO(yolo_model_path)

    best_frame = None
    best_confidence = 0
    best_area = 0
    best_bbox = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        results = model(frame)
        for r in results:
            for box in r.boxes:
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                area = (x2 - x1) * (y2 - y1)

                if conf > best_confidence or (conf == best_confidence and area > best_area):
                    best_confidence = conf
                    best_area = area
                    best_frame = frame.copy()
                    best_bbox = (x1, y1, x2, y2)

    cap.release()

    if best_frame is not None and best_bbox is not None:
        x1, y1, x2, y2 = best_bbox
        cv2.rectangle(best_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)

        label = "license_plate"
        font = cv2.FONT_HERSHEY_SIMPLEX
        scale = 0.7
        thickness = 2
        label_size, _ = cv2.getTextSize(label, font, scale, thickness)
        label_w, label_h = label_size

        text_bg_y1 = max(0, y1 - label_h - 10)
        text_bg_y2 = y1
        cv2.rectangle(best_frame, (x1, text_bg_y1), (x1 + label_w + 10, text_bg_y2), (0, 255, 0), -1)
        cv2.putText(best_frame, label, (x1 + 5, y1 - 5), font, scale, (0, 0, 0), thickness)

        timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
        labeled_frame_path = os.path.join(save_dir, f"plate_{timestamp}.jpg")
        cropped_plate_path = os.path.join(save_dir, f"plate_cropped_{timestamp}.jpg")

        cv2.imwrite(labeled_frame_path, best_frame)

        cropped_plate = best_frame[y1:y2, x1:x2]
        cv2.imwrite(cropped_plate_path, cropped_plate)

        return labeled_frame_path, cropped_plate_path

    return None, None

# Step 3: Run OCR on the cropped plate image
def run_ocr_on_plate(cropped_image_path):
    image = cv2.imread(cropped_image_path)
    if image is None:
        print(f"Could not read image: {cropped_image_path}")
        return ""

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    gray = cv2.GaussianBlur(gray, (5, 5), 0)
    gray = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

    text = pytesseract.image_to_string(gray, lang='eng+nep')
    
    # Clean up the text: remove line breaks and unwanted characters
    text = text.replace('\n', ' ').replace('\r', '').strip()
    text = text.replace('(', '').replace(')', '').replace(',', '').replace(']', '') \
               .replace('.', '').replace('&', '').replace('|', '')
    
    print(f"\nDetected Text: {text}")
    return text


# Step 4: Save OCR result to JSON
def save_to_json(text, image_path):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    json_dir = os.path.join(base_dir, "json")
    os.makedirs(json_dir, exist_ok=True)

    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    json_data = {
        "timestamp": timestamp,
        "image": os.path.basename(image_path),
        "detected_text": text  # Now this is flattened (no \n)
    }

    json_path = os.path.join(json_dir, f"plate_{timestamp}.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(json_data, f, ensure_ascii=False, indent=4)

    print(f"JSON saved: {json_path}")


# Main
if __name__ == "__main__":
    if sensor_triggered:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(base_dir, "best.pt")

        video_path = capture_video(duration=3)
        print(f"Video saved at: {video_path}")

        labeled_frame_path, cropped_plate_path = analyze_and_annotate(
            video_path,
            yolo_model_path=model_path
        )

        if labeled_frame_path and cropped_plate_path:
            print(f"Frame saved: {labeled_frame_path}")
            print(f"Cropped plate saved: {cropped_plate_path}")
            detected_text = run_ocr_on_plate(cropped_plate_path)
            save_to_json(detected_text, cropped_plate_path)
        else:
            print("No license plate detected.")
