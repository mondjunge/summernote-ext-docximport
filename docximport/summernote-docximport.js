(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('jquery'));
  } else {
    // Browser globals
    factory(window.jQuery);
  }
}(function (jQuery) {

  jQuery.extend(jQuery.summernote.plugins, {
    'docximport': function (context) {

      const ui = $.summernote.ui;
	  const options = context.options;
      const $editor = context.$note//$(editor);

      // file input erstellen (unsichtbar)
      const $input = $('<input type="file" accept=".docx" style="display:none"/>')
        .on('change', function () {
          const file = this.files[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onload = async function (e) {
            try {
              const result = await mammoth.convertToHtml({ arrayBuffer: e.target.result });
              const cleanHtml = result.value;

              // HTML direkt an Cursorposition einfügen
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = cleanHtml;
                const frag = document.createDocumentFragment();
                while (tempDiv.firstChild) {
                  frag.appendChild(tempDiv.firstChild);
                }
                range.deleteContents();
                range.insertNode(frag);
                selection.collapseToEnd();
				
              }
			  // checngedetection anstoßen
			  const html = $editor.summernote('code');
			  //textArea.value = html
		  	  $editor.summernote('triggerEvent', 'change', html, $editor);
			  console.log("EditorContext", html, context );
			  

              $input.val(''); // reset input
            } catch (err) {
              console.warn('Fehler beim Einfügen der docx-Datei', err);
              alert('Die Datei konnte nicht verarbeitet werden.');
            }
          };
          reader.readAsArrayBuffer(file);
        });

      // input in DOM einfügen
      context.layoutInfo.editor.append($input);
	  

      // Button erstellen
      context.memo('button.docximport', function () {
        return ui.button({
          contents: options.icons.docximport ? ui.icon(options.icons.docximport): '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100" rx="8" ry="8" /><text x="60" y="75" font-size="60" font-family="Arial, sans-serif" fill="black" text-anchor="middle">W</text><rect x="25" y="30" width="70" height="2" fill="black" /><rect x="25" y="40" width="70" height="2" fill="black" />  <rect x="25" y="50" width="70" height="2" fill="black" /></svg>',
          tooltip: 'Import Word (.docx)',
		  container: 'body',
          click: function () {
            $input.trigger('click');
          }
        }).render();
      });
    }
  });

}));
