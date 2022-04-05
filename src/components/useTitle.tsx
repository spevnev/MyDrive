import React from "react";

const useTitle = (title: string) => document.title = `${title} | MyDrive`;

export default useTitle;