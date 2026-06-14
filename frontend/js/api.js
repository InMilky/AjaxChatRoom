$.ajaxSetup({
  xhrFields: { withCredentials: true },
  dataType: "json",
});

function apiURL(path) {
  return `${API_BASE_URL}${path}`;
}

function apiRequest(method, path, data) {
  const token = sessionStorage.getItem("token");
  return $.ajax({
    method: method,
    url: apiURL(path),
    data: data,
    beforeSend(xhr) {
      if (token) {
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      }
    },
  });
}

const API = {
  login(payload) {
    return apiRequest("POST", "/user/login", payload);
  },
  register(payload) {
    return apiRequest("POST", "/user/register", payload);
  },
  logout() {
    return apiRequest("GET", "/user/logout");
  },
  online() {
    return apiRequest("GET", "/user/online");
  },
  isLogin() {
    return apiRequest("GET", "/user/isLogin");
  },
  getInfo(id) {
    return apiRequest("GET", "/user/getInfo", { id });
  },
  publicGetAll() {
    return apiRequest("GET", "/public/getAll");
  },
  publicSend(content) {
    return apiRequest("POST", "/public/send", { content });
  },
  privateGetAll(id) {
    return apiRequest("GET", "/private/getAll", { id });
  },
  privateSend(uto, content) {
    return apiRequest("POST", "/private/send", { uto, content });
  },
};

function setFieldMessage(selector, message, isError) {
  const $el = $(selector);
  $el.html(message);
  $el.removeClass("alert-danger alert-info");
  $el.addClass(isError ? "alert-danger" : "alert-info");
}

function validateFieldLength(value, min, max, selector, fieldName) {
  if (value.length < min) {
    setFieldMessage(selector, `${fieldName}太短了`, true);
    return false;
  }
  if (value.length > max) {
    setFieldMessage(selector, `${fieldName}太长了`, true);
    return false;
  }
  setFieldMessage(selector, `${fieldName}长度合法`, false);
  return true;
}
