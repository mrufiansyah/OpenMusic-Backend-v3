/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */

const autoBind = require('auto-bind');

class playlistHandler {
  constructor(service, songService, validator) {
    this._service = service;
    this._songService = songService;
    this._validator = validator;

    autoBind(this);
  }

  // add playlist
  async postPlaylistHandler(request, h) {
    await this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;

    const playlistId = await this._service.addPlaylists({ name, owner: credentialId });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  // get playlist
  async getplaylistHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);

    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  // delete playlist
  async deletePlaylistByIdHandler(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;

    console.log('2', request.params, credentialId);
    console.log('2', id, credentialId);
    await this._service.verifyPlaylistsOwner(id, credentialId);
    await this._service.deletePlaylist(id);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  // playlist song handler
  // add song to playlist handler
  async postPlaylistSongHandler(request, h) {
    await this._validator.validatePlaylistSongPayload(request.payload);
    const { songId } = request.payload;

    const { id: credentialId } = request.auth.credentials;
    const { playlistId } = request.params;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.verifySongId(songId);
    await this._service.postSongToPlaylist(playlistId, songId);
    await this._service.addActivities(playlistId, songId, credentialId);

    const response = h.response({
      status: 'success',
      message: 'Song di playlists berhasil ditambahkan',
    });

    response.code(201);
    return response;
  }

  // get song from palylist handler
  async getPlaylistSongByIdHandler(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._service.getPlaylistById(playlistId);
    const song = await this._service.getSongsFromPlaylist(playlistId);
    const playlistSongs = playlist.map((p) => ({
      id: p.id,
      name: p.name,
      username: p.username,
      songs: song,
    }));

    const response = h.response({
      status: 'success',
      data: {
        playlist: Object.assign({}, ...playlistSongs),
      },
    });

    return response;
  }

  // delete song from playlist
  async deletePlaylistSongByIdHandler(request) {
    // cek format payload
    this._validator.validatePlaylistSongPayload(request.payload);

    const { playlistId } = request.params;
    const { songId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongFromPlaylist(songId);
    await this._service.deleteActivities(playlistId, songId, credentialId);

    return {
      status: 'success',
      message: 'Lagu Playlist berhasil dihapus',
    };
  }

  async getPlaylistActivitiesHanlder(request, h) {
    const { playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    console.log('cek var', playlistId, credentialId);
    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const getActivities = await this._service.getPlaylistSongActivities(playlistId, credentialId);

    const response = h.response({
      status: 'success',
      data: {
        playlistId: getActivities[0].playlist_id,
        activities: getActivities.map((a) => ({
          username: a.username,
          title: a.title,
          action: a.action,
          time: a.time,
        })),

      },

    });
    return response;
  }
}

module.exports = playlistHandler;
