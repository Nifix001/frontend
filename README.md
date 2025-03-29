

# Document Signer - PDF Annotation Tool

Document Signer is a web-based PDF annotation tool that allows users to upload PDF documents and add various annotations like highlights, underlines, comments, and signatures.

## Setup and Running Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. Install dependencies:
```sh
npm install
# or
yarn install
```

3. Start the development server:
```sh
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## Features

- **PDF Upload**: Upload and view PDF documents
- **Page Navigation**: Navigate through PDF pages
- **Zoom Controls**: Zoom in and out to adjust the document view
- **Annotation Tools**:
  - Highlight text
  - Underline text
  - Add comments to specific locations
  - Add signatures to the document
- **Undo Functionality**: Revert the last annotation
- **Export**: Save annotated documents

## Libraries and Tools Used

- **React**: Frontend library for building user interfaces
- **TypeScript**: For static type checking
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Component library built on top of Tailwind CSS
- **react-pdf**: PDF rendering library for React
- **pdf-lib**: Library for creating and modifying PDF documents
- **react-dropzone**: For file upload functionality
- **uuid**: For generating unique identifiers for annotations
- **lucide-react**: Icon library

### Why These Tools?

- **React & TypeScript**: Provides a robust foundation with type safety
- **Tailwind CSS & shadcn/ui**: Enables rapid UI development with consistent design
- **react-pdf**: Offers powerful PDF rendering capabilities in the browser
- **pdf-lib**: Provides necessary tools for document manipulation without server-side processing
- **react-dropzone**: Simplifies file upload with drag-and-drop functionality

## Architecture

The application follows a component-based architecture:

- **Index**: Main page that orchestrates the application flow
- **UploadArea**: Handles file uploads
- **DocumentViewer**: Container for PDF viewing and annotation
  - **DocumentControls**: Navigation and zoom controls
  - **DocumentPage**: PDF page renderer and interaction handler
  - **AnnotationLayer**: Renders annotations on top of PDF pages
- **AnnotationTools**: Toolbar for selecting annotation types and colors
- **Modal Components**: 
  - **CommentModal**: For adding text comments
  - **SignatureModal**: For drawing signatures

## Challenges Faced and Solutions

### PDF Rendering and Annotation Positioning

**Challenge**: Aligning annotations correctly with PDF content, especially when zooming and navigating.

**Solution**: Implemented a coordinate system based on the PDF's viewport. Created a separate annotation layer that overlays the PDF content and adjusts position based on scale.

### Signature Drawing Implementation

**Challenge**: Creating a smooth drawing experience for signatures.

**Solution**: Used HTML5 Canvas for drawing capabilities. Implemented touch and mouse event handlers for cross-device compatibility.

### PDF Export with Annotations

**Challenge**: Applying annotations to the PDF for export.

**Solution**: Used pdf-lib to modify the original PDF. Each annotation type required different handling to correctly apply it to the document.

### State Management

**Challenge**: Managing the state of annotations across different pages and tools.

**Solution**: Centralized annotation state in the main component, allowing for easier undo functionality and consistent rendering across pages.

## Future Enhancements

If given more time, these features would be valuable additions:

1. **Text Selection**: Enable true text selection for more accurate highlighting and underlining
2. **Annotation Editing**: Allow users to move, resize, or delete specific annotations
3. **Persistent Storage**: Save annotation data to local storage or a database
4. **Collaboration**: Real-time collaborative annotation with multiple users
5. **More Annotation Types**: Add shapes, arrows, freehand drawing, and text boxes
6. **Search Functionality**: Search within the PDF content
7. **Annotation Summary**: Create a summary panel showing all annotations with navigation
8. **Mobile Optimization**: Further improvements for touch devices
9. **Performance Optimization**: For handling large documents or many annotations
10. **Customizable Themes**: Allow users to customize the interface appearance

## License

[MIT License](LICENSE)
