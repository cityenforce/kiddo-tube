const assert = require('node:assert/strict');
const test = require('node:test');
const db = require('../src/models/db');
const { moderateContentHandler } = require('../src/controllers/adminController');

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  }
});

test('admin video removal deletes the selected video and confirms success', async (t) => {
  const originalDeleteVideo = db.deleteVideo;
  let deletedVideoId = null;
  db.deleteVideo = async (id) => {
    deletedVideoId = id;
    return true;
  };
  t.after(() => {
    db.deleteVideo = originalDeleteVideo;
  });

  const response = createResponse();
  await moderateContentHandler(
    { body: { type: 'video', id: 'video-to-remove', action: 'REMOVE' } },
    response,
    (error) => {
      throw error;
    }
  );

  assert.equal(deletedVideoId, 'video-to-remove');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.success, true);
});

test('admin video removal reports a missing video instead of false success', async (t) => {
  const originalDeleteVideo = db.deleteVideo;
  db.deleteVideo = async () => false;
  t.after(() => {
    db.deleteVideo = originalDeleteVideo;
  });

  const response = createResponse();
  await moderateContentHandler(
    { body: { type: 'video', id: 'missing-video', action: 'REMOVE' } },
    response,
    (error) => {
      throw error;
    }
  );

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.success, false);
  assert.equal(response.body.error, 'Video not found');
});
