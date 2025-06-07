const BASE_URL = import.meta.env.VITE_BASE_URL;

export const userAPI = {
    SIGNUP_API: BASE_URL + "/user/signup",
    LOGIN_API: BASE_URL + "/user/login",
    SEARCH_USER_API: BASE_URL + "/user/profile",
}

export const chatAPI = {
    GET_ALL_CHATS_API: BASE_URL + "/chat",
    ACCESS_CHAT_API: BASE_URL + "/chat",
    CREATE_GROUPCHAT_API: BASE_URL + "/chat/group",
    REMOVE_USER_FROM_GROUP : BASE_URL + "/chat/group-remove",
    ADD_USER_TO_GROUP: BASE_URL + "/chat/group-add",
    RENAME_GROUP_API: BASE_URL + "/chat/rename",
    LEAVE_GROUP_API : BASE_URL + "/chat/leave"
}