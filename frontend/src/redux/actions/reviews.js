export const FETCH_REVIEWS = 'FETCH_REVIEWS';

const baseUrl = 'http://localhost:7000/'

export const fetchReviews = async (id) => {
    const response = await fetch(`${baseUrl}review/options/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.message || 'Error fetching reviews');
    }

    return responseData.data?.review || [];
};