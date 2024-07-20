import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomID, onCodeChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = CodeMirror.fromTextArea(document.getElementById('realtimeEditor'), {
        mode: { name: 'javascript', json: true },
        theme: 'dracula',
        autoCloseTags: true,
        autoCloseBrackets: true,
        lineNumbers: true
      });

      editorRef.current.on('change', (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== 'setValue') {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomID,
            code,
          });
        }
      });
    }
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      const handleCodeChange = ({ code }) => {
        if (code !== null && editorRef.current) {
          editorRef.current.setValue(code);
        }
      };

      socketRef.current.on(ACTIONS.CODE_CHANGE, handleCodeChange);

      return () => {
        if (socketRef.current) {
          socketRef.current.off(ACTIONS.CODE_CHANGE, handleCodeChange);
        }
      };
    }
  }, [socketRef.current]);

  return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;


