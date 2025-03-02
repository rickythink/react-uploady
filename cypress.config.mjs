export default {
    e2e: {
        "port": 8089,
        "specPattern": "**/*-spec.js",
        "chromeWebSecurity": false,
        "video": false,
        "env": {
            "storybookPath": "/?path=/story/",
            "components": {
                "uploader": "core-uploader",
                "uploady": "ui-uploady",
                "chunkedUploady": "ui-chunked-uploady",
                "retryHooks": "ui-retry-hooks",
                "uploadButton": "ui-upload-button",
                "uploadDropZone": "ui-upload-drop-zone",
                "uploadUrlInput": "ui-upload-url-input",
                "uploadPreview": "ui-upload-preview",
                "uploadPaste": "ui-upload-paste",
                "tusUploady": "ui-tus-uploady",
                "nativeUploady": "react-native-native-uploady",
                "chunkedSender": "core-chunked-sender"
            }
        },
        "projectId": "excxm9"
    }
};
