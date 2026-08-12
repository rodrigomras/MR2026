/**
 * Google Apps Script — recebe as mensagens do formulário
 * "Deixem uma Mensagem aos Noivos" do site e acrescenta-as
 * a um Google Doc.
 *
 * ── Configuração ──────────────────────────────────────────
 *   1. Abram (ou criem) o Google Doc onde querem guardar as
 *      mensagens e copiem o ID a partir do URL:
 *        https://docs.google.com/document/d/ESTE_TRECHO_É_O_ID/edit
 *   2. Colem esse ID na constante DOC_ID, aqui em baixo.
 *   3. Em https://script.google.com, criem um novo projeto,
 *      apaguem o código de exemplo e colem TODO este ficheiro.
 *   4. Guardem o projeto (Ctrl/Cmd+S).
 *   5. Implementar → Nova implementação:
 *        - Tipo: "Aplicação Web"
 *        - Executar como: "Eu" (a vossa conta)
 *        - Quem tem acesso: "Qualquer pessoa"
 *      Cliquem em "Implementar" e autorizem o acesso quando
 *      pedido (é o vosso próprio script a aceder ao vosso Doc).
 *   6. Copiem o URL da aplicação Web gerado.
 *   7. Colem esse URL na constante MENSAGEM_SCRIPT_URL, em
 *      script.js (secção 10, perto do fim do ficheiro).
 *
 * Sempre que editarem este ficheiro, é preciso criar uma NOVA
 * implementação (ou "Gerir implementações" → editar a atual)
 * para as alterações ficarem ativas no URL público.
 * ──────────────────────────────────────────────────────────
 */

var DOC_ID = '1yPTN0Oo7QLU-_i7-LCdi040nljEavqOlOEsXRzbzBo4';

function doPost(e) {
  var doc = DocumentApp.openById(DOC_ID);
  var corpo = doc.getBody();

  var nome = ((e && e.parameter && e.parameter.nome) || '').trim();
  var valor = ((e && e.parameter && e.parameter.valor) || '').trim();
  var mensagem = ((e && e.parameter && e.parameter.mensagem) || '').trim();
  var data = Utilities.formatDate(new Date(), 'GMT', "dd/MM/yyyy HH:mm 'GMT'");

  if (nome && mensagem) {
    var cabecalho = nome + (valor ? ' (' + valor + ')' : '') + ' — ' + data;
    corpo.appendParagraph(cabecalho).setBold(true);
    corpo.appendParagraph(mensagem);
    corpo.appendParagraph(''); // linha em branco entre mensagens
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
