const axios = require('axios');
const db = require("./db");

const apiKey = 'AIzaSyDizEz7mCnAJucPd5aXeyV1Uwmp69Q7O2s';
const baseApiUrl = 'https://www.googleapis.com/youtube/v3';
const podcastId = 'PLdrsmUK4QNKpok8NL72UH825TBYveuLwt'
const url = `${baseApiUrl}/playlistItems?key=${apiKey}&playlistId=${podcastId}&maxResults=50&part=snippet`;

const postBooks = async (req, res) => {
    const batch = db.batch();
    const booksArray = req.body;

    let books = [];
    const querySnapshot = await db.collection('books').get();

    querySnapshot.forEach((doc) => {
        books.push(doc.data());
    });

    const filteredBooks = booksArray.filter((item) =>
        !books.find((book) =>
            book.title === item.title
            && book.author === item.author
            && book.podcastId === item.podcastId));

    if (filteredBooks.length) {
        filteredBooks.forEach((book) => {
            const docRef = db.collection("books").doc(new Date().getTime().toString());
            batch.set(docRef, book);
        });

        await batch.commit();
    }

    return res.send(filteredBooks)
}

const getVideosInfo = async (req, res) => {
    const batch = db.batch();
    const querySnapshot = await db.collection('videos').get();
    let videos = [];

    querySnapshot.forEach((doc) => {
        videos.push(doc.data().snippet?.resourceId?.videoId);
    });

    let numberOfVideos = 0;
    let totalVideos = 0;
    let nextPageToken = null;
    let findedUTVideos = [];

    const response = async (token) => {
        const addon = !!token ? '&pageToken=' + token : '';

        await axios.get(url + addon)
            .then(({ data }) => {
                findedUTVideos = [...findedUTVideos, ...data.items];
                numberOfVideos += data.pageInfo.resultsPerPage;
                totalVideos = data.pageInfo.totalResults;
                nextPageToken = data.nextPageToken || null;

                return findedUTVideos;
            });
    }

    await response(null);

    while (numberOfVideos <= totalVideos && !!nextPageToken) {
        await response(nextPageToken);
    }

    const filteredVideos = mapDataItems(findedUTVideos, videos)
        .filter((item) => !videos.find((id) => id === item.snippet?.resourceId?.videoId))

    if (filteredVideos.length) {
        filteredVideos.forEach((item) => {
            const docRef = db.collection("videos").doc(item.snippet.resourceId?.videoId);
            batch.set(docRef, item);
        })

        batch.commit()
    }

    res.send(JSON.stringify(filteredVideos))
}

function mapDataItems(items) {
    return items
        .map((item) => {
            const timeReg = /(([0-9]){2}:){1,2}([0-9]){2}/g;
            const videoId = item.snippet.resourceId?.videoId;
            const urlToVideo = 'https://youtu.be/' + videoId;
            const urlForEmbaded = 'https://www.youtube.com/embed/' + videoId;

            const setTimeCode = times => {
                const time = times.match(timeReg)[0];
                const timeToSecond = time
                    .split(':')
                    .map(timeToSecondsFunction)
                    .reduce((prev, curr) => prev + curr, 0);

                return {
                    description: times.split(' ').slice(2).join(' '),
                    time,
                    url: urlToVideo + '?t=' + timeToSecond,
                    embadedUrl: urlForEmbaded + '?start=' + timeToSecond
                }
            }

            item.snippet.timecodes = item.snippet.description
                .slice(
                    item.snippet.description.indexOf('00:00'),
                    item.snippet.description.indexOf('Слухати подкаст на стрімінгових платформах:'))
                .split('\n')
                .filter((code) => code.match(timeReg))
                .map(setTimeCode);

            return item;
        })
        .filter((item) => !!item.snippet.timecodes.length)
}

const timeToSecondsFunction = (t, index, array) => {
    if (array.length - 1 === index) {
        return +t;
    } else if (array.length === 3 && !index) {
        return +t * 60 * 60
    } else if (array.length - 1 !== index) {
        return +t * 60
    }
};

module.exports = {getVideosInfo, postBooks}