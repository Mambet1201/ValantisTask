import React, { useEffect, useState } from "react";
import axios from "axios";
import md5 from "md5";
import dayjs from "dayjs";
const HomePage = () => {
  const [itemsApi, setItemsApi] = useState([]);
  const [isLoading, setIsloading] = useState(false);
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [pages, setPages] = useState(1);

  const day = dayjs();
  const password = md5(`Valantis_${day.format("YYYYMMDD")}`);
  const url = "http://api.valantis.store:40000/";

  const data = {
    action: "get_ids",
    params: { offset: pages, limit: 50 },
  };

  async function sendDataItems(url, data) {
    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          "x-auth": password,
        },
      });
      setItemsApi(response.data.result);
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
    }
  }

  async function sendData(url, data) {
    setIsloading(true);
    try {
      const response = await axios.post(url, data, {
        headers: {
          "Content-Type": "application/json",
          "x-auth": password,
        },
      });
      const itemsData = {
        action: "get_items",
        params: { ids: [...new Set(response.data.result)] },
      };
      await sendDataItems(url, itemsData);
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
    }
    setIsloading(false);
  }

  async function filteredByBrand(url) {
    setIsloading(true);
    try {
      const response = await axios.post(
        url,
        {
          action: "filter",
          params: { brand: brand },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth": password,
          },
        }
      );
      const brandData = {
        action: "get_items",
        params: { ids: [...new Set(response.data.result)] },
      };
      sendDataItems(url, brandData);
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
    }
    setIsloading(false);
    console.log("Завершена ");
  }
  async function filteredByPrice(url) {
    setIsloading(true);
    try {
      const response = await axios.post(
        url,
        {
          action: "filter",
          params: { price: Number(price) },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-auth": password,
          },
        }
      );
      const priceData = {
        action: "get_items",
        params: { ids: [...new Set(response.data.result)] },
      };
      await sendDataItems(url, priceData);
    } catch (error) {
      console.error("Ошибка при выполнении запроса:", error);
    }
    setIsloading(false);
  }

  useEffect(() => {
    if (price.trim() && !brand.trim()) {
      filteredByPrice(url);
    } else if (brand.trim()) {
      filteredByBrand(url);
    } else sendData(url, data);
  }, [pages, brand, price]);

  return (
    <div className="cont">
      <div className="pagination">
        <h1>Valantis Test</h1>

        <div className="inputForm">
          <label>
            Фильтрация по бренду
            <input
              type="text"
              placeholder="пример ввода : Baraka"
              value={brand}
              disabled={price}
              onChange={(e) => setBrand(e.target.value)}
            />
          </label>
          <label>
            Фильтровать по цене
            <input
              type="number"
              value={price}
              disabled={brand}
              onChange={(e) => setPrice(e.target.value)}
            />
          </label>
        </div>
        <div>
          <button onClick={() => setPages(pages - 40)}>назад</button>
          <button onClick={() => setPages(pages + 40)}>вперед</button>
        </div>
      </div>
      {isLoading ? (
        <div className="loading">
          <h1>ЗАГРУЗКА</h1>
        </div>
      ) : (
        <div className="container">
          {itemsApi?.map((el, index) => (
            <div className="item">
              <h3>{el.brand === null ? "Brand NULL" : el.brand}</h3>
              <p>{el.id}</p>
              <p>{el.product}</p>
              <p>{el.price}рублей</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
