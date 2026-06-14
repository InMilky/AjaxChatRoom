const MESSAGE_MODAL_ID = "commonMessageModal";

function ensureCommonModal() {
  if ($(`#${MESSAGE_MODAL_ID}`).length) {
    return;
  }
  const modalHtml = `
    <div id="${MESSAGE_MODAL_ID}" class="modal fade" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-sm" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title"></h4>
          </div>
          <div class="modal-body">
            <p></p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-info" data-dismiss="modal">确定</button>
          </div>
        </div>
      </div>
    </div>`;
  $("body").append(modalHtml);
}

function showMessageModal(message, title = "提示", onClose) {
  ensureCommonModal();
  const $modal = $(`#${MESSAGE_MODAL_ID}`);
  $modal.find(".modal-title").text(title);
  $modal.find(".modal-body p").text(message);
  $modal.off("hidden.bs.modal");
  if (typeof onClose === "function") {
    $modal.on("hidden.bs.modal", function () {
      onClose();
    });
  }
  $modal.modal("show");
}

function showErrorModal(message) {
  showMessageModal(message, "错误");
}

function showSuccessModal(message, onClose) {
  showMessageModal(message, "成功", onClose);
}

function handleAjaxError(xhr, err) {
  console.error("Ajax Error:", err, xhr);
  let message = "网络请求异常，请稍后重试。";
  if (xhr && xhr.responseJSON && xhr.responseJSON.msg) {
    message = xhr.responseJSON.msg;
  }
  showErrorModal(message);
}
