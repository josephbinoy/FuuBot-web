import axios from 'axios';

export async function getGuestToken() {
    try {
        const response = await axios.post('https://osu.ppy.sh/oauth/token', {
            grant_type: 'client_credentials',
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            scope: 'public'
        });

        if (response.status == 200) {
            if (response.data) {
                return response.data.access_token;
            } else {
                return '';
            }
        } else {
            console.error(`Error: Received status code ${response.status}`);
            return '';
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return '';
    }
}

export async function fetchBeatmapsetAndArtistName(beatmapsetId, bearerToken) {
    try {
      const url = 'https://osu.ppy.sh/api/v2/beatmapsets/' + beatmapsetId;
  
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${bearerToken}`,
        },
      });
  
      if (response.status == 200) {
          if (response.data) {
              return {
                  artist: response.data.artist,
                  title: response.data.title,
                  cover: response.data.covers.cover,
                  mapper: response.data.creator,
              }
          } else {
              return {
                artist: '',
                title: '',
                cover: '',
                mapper: '',
              };
          }
      } else {
          console.error(`Error: Received status code ${response.status}`);
          return {
            artist: '',
            title: '',
            cover: '',
            mapper: '',
        };
      }
      } catch (error) {
          console.error(`Error: ${error.message}`);
          return {
                artist: '',
                title: '',
                cover: '',
                mapper: '',
          };
      }
  }