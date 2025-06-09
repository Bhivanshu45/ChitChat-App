export const getSender = (loggedUser,usersArray) => {
    return usersArray[0]._id === loggedUser._id ? usersArray[1] : usersArray[0];
}

export const isSameSender = (messages,m,i) => {
    return (
      i < messages.length - 1 && messages[i + 1].sender._id !== m.sender._id
    );
}

export const isLastMessage = (messages,i,userId) => {
    return i === messages.length - 1 && messages[i].sender._id !== userId;
}