# X-Ray Insight: Explainable AI Diagnosis

X-Ray Insight is a medical imaging assistant designed to analyze chest X-rays. It uses advanced computer vision to provide a second opinion on pneumonia cases, featuring **Explainable AI (XAI)** capabilities that visualize exactly where the model is looking.

## 🚀 System Workflow

The application follows a streamlined process to ensure privacy and speed:

1.  **Image Input**: 
    *   User uploads a chest X-ray (PNG/JPEG) via the drag-and-drop interface.
    *   The image is converted to a base64 string locally in the browser.
2.  **AI Analysis**: 
    *   The encoded image is securely transmitted to the multimodal vision model.
    *   The model analyzes the image for pathological patterns (opacity, consolidation).
3.  **Structured Extraction**: 
    *   The system extracts a diagnosis, confidence score, and specific ROI (Regions of Interest) coordinates.
    *   It generates a natural language summary of the findings.
4.  **Visualization**: 
    *   Heatmap regions are overlaid onto the original image using the coordinate data.
    *   A medical-grade report is rendered for the user.

## 📦 Features

*   **Intelligent Diagnosis**: Rapid screening for Pneumonia versus Normal lungs.
*   **Visual Explanations**: Dynamic heatmaps show the AI's focus areas, helping radiologists verify the result.
*   **Structured Reporting**: Automated generation of key findings and medical summaries.
*   **Privacy-First**: Client-side processing ensures images are handled securely during the session.

## 🛠️ Setup & Installation

### Prerequisites
*   Node.js (v18 or higher)
*   A valid API Key (Google GenAI SDK compatible)

### Environment Configuration
1.  Clone this repository.
2.  Create a `.env` file in the project root:
    ```env
    API_KEY=your_api_key_here
    ```

### Running the Application
This project is built with React and Vite (or compatible bundler).

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Start the development server**:
    ```bash
    npm run dev
    ```
3.  **Open in Browser**:
    Navigate to `http://localhost:5173` (or the port shown in your terminal).

## 📝 Usage Guide

1.  **Upload**: Drag a chest X-ray image onto the upload zone. You can use the "Demo Cards" at the bottom to test with pre-loaded medical data.
2.  **Analyze**: Watch the scanning animation as the AI processes the image.
3.  **Interpret**:
    *   **Visual**: Toggle the "Show Heatmap" button to see the highlighted regions of interest. Red indicates high importance/severity.
    *   **Textual**: Read the "AI Reasoning" and "Key Findings" on the right panel.

## ⚠️ Disclaimer
**For Research & Demonstration Only.** This tool is not a certified medical device. It should not be used for actual medical diagnosis or treatment. Always consult a qualified healthcare professional for medical advice.
