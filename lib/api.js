import axios from "axios";

// Set default base URL for axios
axios.defaults.baseURL = "http://localhost:3001";

// Tell axios to send cookies with every request
axios.defaults.withCredentials = true;

// --- AUTH API ---
export const loginUser = async (credentials) => {
  const { data } = await axios.post('/admin/login', credentials);
  return data;
};

export const logoutUser = async () => {
  await axios.post('/admin/logout');
};

export const registerUser = async (userInfo) => {
  const { data } = await axios.post('/user', userInfo);
  return data;
};

// --- DATA FETCHING (useQuery) ---
export const fetchUserList = async (advanced) => {
  const url = advanced ? "/user/list?advanced=true" : "/user/list";
  const { data } = await axios.get(url);
  return data;
};

export const fetchUser = async (userId) => {
  const { data } = await axios.get(`/user/${userId}`);
  return data;
};

export const fetchPhotosOfUser = async (userId) => {
  const { data } = await axios.get(`/photosOfUser/${userId}`);
  return data;
};

export const fetchCommentsOfUser = async (userId) => {
  const { data } = await axios.get(`/commentsOfUser/${userId}`);
  return data;
};

// --- DATA MUTATION (useMutation) ---
export const addComment = async ({ photoId, comment }) => {
  const { data } = await axios.post(`/commentsOfPhoto/${photoId}`, { comment });
  return data;
};

export const uploadPhoto = async (formData) => {
  const { data } = await axios.post('/photos/new', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};