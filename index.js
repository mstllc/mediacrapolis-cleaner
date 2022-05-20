// Fetch latest TV episodes & movies from Ombi
const ombiFetch = (path, method = 'GET') => new Promise((resolve, reject) =>
    fetch(`${process.env.OMBI_BASE_URL}${path}`,
        {
            method,
            headers: {
                'ApiKey': process.env.OMBI_API_KEY
            }
        })
        .then(response => response.json())
        .then(json => resolve(json))
        .catch(error => reject(error))
)

const ombiFetchTV = () => ombiFetch('/Requests/tv/available/15/0/requestedDate/asc');
const ombiFetchMovies = () => ombiFetch('/Requests/movie/available/15/0/requestedDate/asc');
const ombiFetchOldestMoviesAndTV = () => Promise.all([ombiFetchMovies(), ombiFetchTV()]).then(([movies, tv]) => movies.concat(tv))

    ((async () => {
        const moviesAndTV = await ombiFetchOldestMoviesAndTV();

        // const moviesToFetch = movies.map(movie => ({
        //     title: movie.title,
        //     year: movie.year,
        //     imdbId: movie.imdbId,
        //     ombiId: movie.id,
        //     ombiRequestedDate: movie.requestedDate,
        //     ombiRequestedBy: movie.requestedBy,
        //     ombiRequestedById: movie.requestedById,
        //     ombiRequestedByUsername: movie.requestedByUsername,
        //     ombiRequestedByEmail: movie.requestedByEmail,
        //     ombiRequestedByFriendlyName: movie.requestedByFriendlyName,
        //     ombiRequestedByImageUrl: movie.requestedByImageUrl,
        //     ombiRequestedByRole: movie.requestedByRole,
        //     ombiRequestedByRoleName: movie.requestedByRoleName,
        //     ombiRequestedByRoleSortName: movie.requestedByRoleSortName,
        //     ombiRequestedByRoleType: movie.requestedByRoleType,
        //     ombiRequestedByRoleTypeName: movie.requestedByRoleTypeName,
        //     ombiRequestedByRoleTypeSortName: movie.requestedByRoleTypeSortName,
        //     ombiRequestedByUserType: movie.requestedByUserType,
        //     ombiRequestedByUserTypeName: movie.requestedByUserTypeName,
        //     ombiRequestedByUserTypeSortName: movie.requestedByUserTypeSortName,
        //     ombiRequestedByUserTypeSortOrder: movie.requestedByUserTypeSortOrder,
        //     ombiRequestedByUserTypeSortOrderName: movie.requestedByUserTypeSortOrderName,
        //     ombiRequestedByUserTypeSortOrderSortName: movie.requestedByUserTypeSortOrderSortName,
        //     ombiRequestedByUserTypeSortOrderSortOrder: movie.requestedByUserTypeSortOrderSortOrder,
        //     ombiRequestedByUserTypeSortOrderSortOrderName: movie
    })());