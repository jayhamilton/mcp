// Ace Editor Initialization Module
export class AceEditorManager {
  static initializeAceEditors() {
    const codeBlocks = document.querySelectorAll('.ace-editor');
    codeBlocks.forEach((block, index) => {
      const editor = ace.edit(block);
      editor.setTheme("ace/theme/monokai");
      editor.session.setMode("ace/mode/javascript");
      editor.setOptions({
        readOnly: true,
        highlightActiveLine: false,
        highlightGutterLine: false,
        showPrintMargin: false,
        fontSize: 14,
        wrap: true,
        useWorker: false
      });
      
      // Set cursor to invisible
      editor.renderer.$cursorLayer.element.style.display = "none";
      
      // Remove focus outline
      editor.container.style.outline = 'none';
      
      // Disable selection
      editor.setOption("selectionStyle", "text");
      editor.selection.setSelectionRange(new ace.Range(0, 0, 0, 0));
    });
  }
}