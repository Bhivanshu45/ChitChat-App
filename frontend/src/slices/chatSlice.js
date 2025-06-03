import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    selectedChat: null,
    chats: [],
    messages: [],
    notifications: [],
    socket: null
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setSelectedChat(state, action) {
            state.selectedChat = action.payload;
        },
        setChats(state, action) {
            state.chats = action.payload;
        },
        setMessages(state, action) {
            state.messages = action.payload;
        },
        setNotifications(state, action) {
            state.notifications = action.payload;
        },
        setSocket(state, action) {
            state.socket = action.payload;
        },
        addMessages(state, action) {
            state.messages.push(action.payload);
        },
        addNotifications(state, action) {
            state.notifications.push(action.payload);
        },
    },
});

export const {setMessages,setChats,setNotifications,setSelectedChat,setSocket, addMessages,addNotifications} = chatSlice.actions;
export default chatSlice.reducer;