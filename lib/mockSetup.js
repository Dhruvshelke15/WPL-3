/**
 * Mock setup for Problem 1 - Replace DOM fakery with axios-mock-adapter
 *
 * This file sets up axios-mock-adapter to intercept API calls and return mock data
 * instead of using the DOM fakery approach from the original project.
 *
 * Students can use this for Problem 1 instead of loading modelData/photoApp.js into the DOM
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import models from "../modelData/photoApp.js";

// Base URL for the API server
const API_BASE_URL = "http://localhost:3001";

// Create mock adapter instance
const mock = new MockAdapter(axios);

// Set up mock responses for all endpoints
mock.onGet(`${API_BASE_URL}/test/info`).reply(200, models.schemaInfo());
mock.onGet(`${API_BASE_URL}/user/list`).reply(200, models.userListModel());
mock.onGet(new RegExp(`${API_BASE_URL}/user/\\w+`)).reply((config) => {
  const id = config.url.split(`${API_BASE_URL}/user/`)[1];
  const user = models.userModel(id);
  return user ? [200, user] : [404, { message: "Not found" }];
});
mock.onGet(new RegExp(`${API_BASE_URL}/photosOfUser/\\w+`)).reply((config) => {
  const id = config.url.split(`${API_BASE_URL}/photosOfUser/`)[1];
  const user = models.userModel(id); // Check if user exists
  if (!user) {
    return [404, { message: "User not found" }];
  }
  const photos = models.photoOfUserModel(id);
  return [200, photos]; // Return photos (or empty array if none)
});

// eslint-disable-next-line no-console
console.log("Mock adapter set up - API calls will be intercepted");

export default mock;
