# X-Ray Insight: Explainable AI Diagnosis

X-Ray Insight is an Explainable AI (XAI) application designed to analyze chest X-rays for pneumonia. It doesn't just provide a diagnosis; it visually explains "Why" by highlighting the specific regions of the image that led to its conclusion.

## Features

-   **AI Diagnosis**: Classifies X-rays as "Pneumonia" or "Normal" with a confidence score.
-   **Visual Explainability**: Overlays a heatmap (simulating techniques like Grad-CAM) to show which lung regions the AI focused on.
-   **Key Findings**: Generates a bulleted list of radiological observations (e.g., "Right lower lobe opacity").
-   **Demo Mode**: Includes pre-loaded medical images for testing without needing your own dataset.

## Setup Instructions

1.  **API Key**: This application requires a valid API Key from Google AI Studio.
    *   The application looks for the API key in the `process.env.API_KEY` environment variable.
    *   Ensure your environment is configured to inject this key.

2.  **Dependencies**:
    *   The project uses React 19 and Tailwind CSS.
    *   The `@google/genai` SDK is used for multimodal analysis.

## Usage

1.  **Upload**: Drag and drop a chest X-ray image (JPEG/PNG) onto the upload zone, or select one of the provided demo cards.
2.  **Analyze**: The system will process the image. This typically takes 2-5 seconds.
3.  **Review**:
    *   **Left Panel**: View the original X-ray with the Explainability Heatmap overlaid. Toggle the "Show Heatmap" button to see the raw image.
    *   **Right Panel**: Read the diagnosis, confidence score, summary, and specific medical findings.

## Disclaimer

**For demonstration purposes only.** This tool is not a certified medical device and should not be used for actual medical diagnosis or treatment. Always consult a qualified healthcare professional.
