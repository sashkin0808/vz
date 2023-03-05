const LIMIT = 8; // количество элементов на странице
let controller, items, startPos, curPage, totalItemsCount;

const request = async (url, method = 'GET', headers = {'X-API-KEY': 'f6946c67-1189-473b-9faa-db4cd41a42fa', 'Content-Type' : 'application/json'}) =>{
    if (controller) {
    	controller.abort();
  	}
  	controller = new AbortController();
  	const signal = controller.signal;
    $('.loader').remove();
    $('.error').remove();
    $('.items_list').before('<span class="loader">loading...</span>');
    try {
        const response = await fetch(url, {method, headers, signal});
        if (!response.ok) {
            throw new Error(`could not fetch ${url}, status: ${response.status}`);
        }
	    const data = await response.json();
	    $('.loader').remove();
        return data;
    } catch(err) {
    	if (!signal.aborted) {
			$('.loader').remove();
	        $('.items_list').before('<span class="error">Error</span>');
    	}
    	throw err;
    } 
};
const getItems = async (page, keyword) => {
	const _apiBase = 'https://kinopoiskapiunofficial.tech/api/v2.2/films';
    const res =  await request(`${_apiBase}?page=${page}${keyword?`&keyword=${keyword}`:''}`);
    return [res.items, res.total];
};

const renderItems = async ({direction = 'next', search, firstPage = false}) => {
	if (firstPage) {
		items = [];
		curPage = 1;
		startPos = -LIMIT;
	}
    let inc = direction =='next' ? LIMIT : -LIMIT;
	if (items.length <= startPos + LIMIT + inc && (items.length < totalItemsCount || totalItemsCount == undefined)) {
		const [data, total] = await getItems(curPage, search);
		if (total == 0) {
            $('.items_list').empty();
			$('.items_list').before('<span class="loader">Ничего не найдено</span>');
			return;
		}
		totalItemsCount = total;
		items = items.concat(data);
		curPage++;
	}
    $('.items_list').empty();
	startPos = startPos + inc;
	if (startPos > 0) {
		$('.js-prev').removeAttr('disabled');
	} else {
		$('.js-prev').attr('disabled', 'disabled');
	}
	if (startPos + LIMIT >= totalItemsCount) {
		$('.js-next').attr('disabled', 'disabled');
	} else {
		$('.js-next').removeAttr('disabled');
	}
	let visItems = items.slice(startPos, startPos + LIMIT);
    visItems.forEach((item) => {
        const {nameRu, nameOriginal, posterUrl, ratingKinopoisk} = item;
        $('.items_list').append(`
            <li class="list_item">
                <div class="list_item__img"><img src=${posterUrl} alt="${nameRu}"/></div>
                <span class="list_item__name">${nameRu ? nameRu : nameOriginal}</span>
                <span class="list_item__rating">${ratingKinopoisk}</span>
            </li>`
        );
    });
};

export default renderItems;