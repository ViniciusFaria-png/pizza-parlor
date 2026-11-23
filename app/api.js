'use strict';

const BASE_URL = 'https://pizza-parlor-zxtf.onrender.com/pizzas';

const requestJson = async (url, options = {}) => {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`Erro na API (${response.status}): ${response.statusText}`);
    }

    return response.json();
};

const getPizzas = async () => requestJson(BASE_URL);

const getPizza = async (id) => requestJson(`${BASE_URL}/${id}`);

const postPizza = async (pizza) => requestJson(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pizza)
});

const putPizza = async (pizza) => requestJson(`${BASE_URL}/${pizza.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pizza)
});

const patchPizza = async (id, dados) => requestJson(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
});

const deletePizza = async (id) => requestJson(`${BASE_URL}/${id}`, {
    method: 'DELETE'
});
