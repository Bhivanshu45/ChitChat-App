const BASE_URL = import.meta.env.VITE_BASE_URL;

export const userAPI = {
    SIGNUP_API: BASE_URL + "/user/signup",
    LOGIN_API: BASE_URL + "/user/login",
    SEARCH_USER_API: BASE_URL + "/user/profile",
}

export const chatAPI = {
    GET_ALL_CHATS_API: BASE_URL + "/chat",
    ACCESS_CHAT_API: BASE_URL + "/chat"
}