import EditorJS from"@editorjs/editorjs"; 
import React, { useEffect } from  "react";

export default function Editor() {

    const initEditor = () => {
        new EditorJS({
            holder: "editor",
        })


    };

    useEffect(() => {
        initEditor();
    }, {});

    return <div id="editor" className="text-xl"></div>;


}