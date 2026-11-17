// Обрано React — бібліотеку для створення користувацьких
// інтерфейсів, яка забезпечує гнучкість розробки,
// можливість вибору додаткових інструментів та має
// велику екосистему готових рішень.

const API_JSONPlaceholder =
  'https://jsonplaceholder.typicode.com/todos?userId=2';

// Відкриває базу даних або створює її, якщо вона ще не існує
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(
        new Error(
          'Ваш браузер не підтримує IndexedDB або доступ до неї обмежений.',
        ),
      );
      return;
    }

    const request = indexedDB.open('WishListDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('wishes')) {
        db.createObjectStore('wishes', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);

    request.onerror = () => {
      reject(
        new Error(
          'Не вдалося відкрити базу даних. Перевірте налаштування браузера.',
        ),
      );
    };
  });
}

// Переносить збережені раніше бажання з localStorage до IndexedDB
async function migrateData() {
  if (localStorage.getItem('migrationCompleted')) {
    return;
  }

  const items = await getAllItems();

  if (items.length === 0) {
    const savedItems = loadFromLocalStorage();

    if (savedItems && savedItems.length > 0) {
      for (const item of savedItems) {
        await addItem(item);
      }
    }
  }

  localStorage.setItem('migrationCompleted', 'true');
}

// Додає нове бажання до бази даних
async function addItem(item) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('wishes', 'readwrite');

    tx.objectStore('wishes').put(item);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Оновлює інформацію про бажання в базі даних
async function updateItem(item) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('wishes', 'readwrite');

    tx.objectStore('wishes').put(item);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Отримує всі бажання, збережені в базі даних
async function getAllItems() {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('wishes', 'readonly');

    const request = tx.objectStore('wishes').getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Видаляє бажання з бази даних за його ID
async function deleteItem(id) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction('wishes', 'readwrite');

    tx.objectStore('wishes').delete(id);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function App() {
  const [deletedWishIds, setDeletedWishIds] = React.useState(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('deletedWishIds'));

      return Array.isArray(savedIds) ? savedIds : [];
    } catch (error) {
      console.error('Помилка читання видалених ID:', error);
      return [];
    }
  });

  const deletedWishIdsRef = React.useRef(deletedWishIds);

  React.useEffect(() => {
    deletedWishIdsRef.current = deletedWishIds;
  }, [deletedWishIds]);

  const [wishList, setWishList] = React.useState([]);

  async function refreshWishList() {
    const items = await getAllItems();
    setWishList(items);
  }

  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [reload, setReload] = React.useState(0);

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError('');

      try {
        await migrateData();

        const items = await getAllItems();

        const savedItems = loadFromLocalStorage();

        if (items.length === 0 && (!savedItems || savedItems.length === 0)) {
          const initialWishes = [
            {
              id: 1,
              title: 'Сумка',
              price: 1000,
              savedAmount: 0,
              url: '-',
              priority: 'high',
              completed: false,
            },
            {
              id: 2,
              title: 'Друшляк',
              price: 500,
              savedAmount: 0,
              url: '-',
              priority: 'low',
              completed: false,
            },
            {
              id: 3,
              title: 'Книжка',
              price: 600,
              savedAmount: 0,
              url: '-',
              priority: 'medium',
              completed: true,
            },
          ];

          for (const wish of initialWishes) {
            await addItem(wish);
          }
        }

        await refreshWishList();

        const response = await fetch(API_JSONPlaceholder);

        if (!response.ok) {
          throw new Error(
            `Помилка HTTP: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();

        const currentItems = await getAllItems();

        const newWishes = data
          .filter(
            (wish) =>
              !deletedWishIdsRef.current.includes(wish.id) &&
              !currentItems.some((item) => item.id === wish.id),
          )
          .map((wish) => ({
            id: wish.id,
            title: wish.title,
            completed: wish.completed,
            price: Math.floor(Math.random() * 10000),
            savedAmount: 0,
            url: '-',
            priority: 'low',
          }));

        for (const wish of newWishes) {
          await addItem(wish);
        }

        await refreshWishList();
      } catch (error) {
        setError(
          'Список бажань недоступний офлайн. Показано раніше завантажені бажання.',
        );

        console.error('Помилка завантаження даних:', error);

        setError(
          error.message.includes('IndexedDB') ||
            error.message.includes('базу даних')
            ? error.message
            : 'Не вдалося завантажити дані. Перевірте підключення до інтернету або дозвіл доступу до сховища у вашому браузері.',
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [reload]);

  const [title, setTitle] = React.useState('');
  const [price, setPrice] = React.useState('');
  const [priority, setPriority] = React.useState('medium');
  const [url, setUrl] = React.useState('');

  async function toggleWish(id) {
    try {
      const wish = wishList.find((item) => item.id === id);

      if (!wish) return;

      const updatedWish = {
        ...wish,
        completed: !wish.completed,
      };

      await updateItem(updatedWish);
      await refreshWishList();
    } catch (error) {
      console.error('Помилка оновлення бажання:', error);
    }
  }

  async function changePriority(id, newPriority) {
    try {
      const wish = wishList.find((item) => item.id === id);

      if (!wish) return;

      const updatedWish = {
        ...wish,
        priority: newPriority,
      };

      await updateItem(updatedWish);
      await refreshWishList();
    } catch (error) {
      console.error('Помилка зміни пріоритету:', error);
    }
  }

  async function removeWish(id) {
    try {
      await deleteItem(id);

      if (typeof id === 'number') {
        const updatedIds = deletedWishIdsRef.current.includes(id)
          ? deletedWishIdsRef.current
          : [...deletedWishIdsRef.current, id];

        deletedWishIdsRef.current = updatedIds;
        setDeletedWishIds(updatedIds);
      }

      await refreshWishList();
    } catch (error) {
      console.error('Помилка видалення бажання:', error);
    }
  }

  React.useEffect(() => {
    localStorage.setItem('deletedWishIds', JSON.stringify(deletedWishIds));
  }, [deletedWishIds]);

  async function addWish(event) {
    event.preventDefault();

    const newWish = {
      id: `local-${Date.now()}`,
      title: title.trim(),
      price: Number(price),
      priority: priority,
      url: url.trim() || '-',
      completed: false,
    };

    try {
      await addItem(newWish);
      await refreshWishList();

      setTitle('');
      setPrice('');
      setUrl('');
      setPriority('medium');
    } catch (error) {
      console.error('Помилка додавання бажання:', error);
    }
  }

  // Оновлює накопичену суму для бажання з урахуванням допустимих меж
  async function addSavings(id, amount) {
    if (!Number.isFinite(amount) || amount === 0) return false;

    try {
      const wish = wishList.find((item) => item.id === id);
      if (!wish) return false;

      const updatedWish = {
        ...wish,
        savedAmount: Math.min(
          Math.max(0, (wish.savedAmount || 0) + amount),
          wish.price,
        ),
      };

      await updateItem(updatedWish);
      await refreshWishList();

      return true;
    } catch (error) {
      console.error('Помилка оновлення накопичень:', error);
      return false;
    }
  }

  return (
    <>
      <main>
        <section>
          <h2>Додати бажання</h2>

          <form className="add-wish-form" onSubmit={addWish}>
            <label htmlFor="add-wish-title-input">Назва бажання</label>

            <input
              className="add-wish-input"
              type="text"
              placeholder="Машина"
              id="add-wish-title-input"
              name="wish-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />

            <label htmlFor="add-wish-price-input">Ціна бажання</label>

            <input
              className="add-wish-input"
              type="number"
              placeholder="10000 (вказується в гривнях)"
              min="0"
              step="0.01"
              id="add-wish-price-input"
              name="wish-price"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              required
            />

            <label htmlFor="add-wish-url-input">
              Посилання на товар (необов'язково)
            </label>

            <input
              className="add-wish-input"
              type="url"
              placeholder="https://example.com/product"
              id="add-wish-url-input"
              name="wish-url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />

            <label htmlFor="wishPriority">Пріоритет</label>

            <select
              name="wish-priority"
              id="wishPriority"
              className="priority-select"
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
            >
              <option value="low">Низький ⚪</option>
              <option value="medium">Середній 🟡</option>
              <option value="high">Високий 🔴</option>
            </select>

            <div className="add-wish-btn-container">
              <button
                type="submit"
                className="add-wish-btn add-wish-btn-submit"
              >
                Додати бажання
              </button>

              <button
                type="button"
                className="add-wish-btn add-wish-btn-reset"
                onClick={() => {
                  setTitle('');
                  setPrice('');
                  setUrl('');
                  setPriority('medium');
                }}
              >
                Очистити поля
              </button>
            </div>
          </form>
        </section>

        <section>
          <h2>Мої бажання</h2>

          {isLoading && <p id="loading">Завантаження...</p>}

          {error && <p id="error-message">{error}</p>}

          <button
            type="button"
            id="retry-btn"
            onClick={() => setReload((prev) => prev + 1)}
            disabled={isLoading}
          >
            Оновити
          </button>

          <div className="cards">
            {wishList.map((wish) => (
              <WishItem
                key={wish.id}
                id={wish.id}
                name={wish.title}
                price={wish.price}
                savedAmount={wish.savedAmount || 0}
                onSave={addSavings}
                url={wish.url}
                priority={wish.priority}
                completed={wish.completed}
                toggle={toggleWish}
                changePriority={changePriority}
                remove={removeWish}
              />
            ))}
          </div>
        </section>
      </main>

      <aside>
        <h2>Підсумкова сума</h2>
        <p>{getTotalCost(wishList)} грн</p>
      </aside>
    </>
  );
}

function WishItem({
  id,
  name,
  price,
  savedAmount,
  onSave,
  url,
  priority,
  completed,
  toggle,
  changePriority,
  remove,
}) {
  // Обчислює відсоток накопичення від ціни товару, обмежуючи його значення від 0 до 100
  const progress = price > 0 ? Math.min((savedAmount / price) * 100, 100) : 0;
  // Зберігає введену користувачем суму для поповнення або зменшення накопичень
  const [amount, setAmount] = React.useState('');

  return (
    <article
      className={`wish-card priority-${priority} ${
        completed ? 'wish-card--purchased' : ''
      }`}
    >
      <button className="delete-btn" type="button" onClick={() => remove(id)}>
        Видалити
      </button>
      <h3>{name}</h3>
      <p>{price} грн</p>
      {/* Відображає прогрес накопичення коштів за допомогою анімованого індикатора */}
      <div className="progress-container">
        <div className="progress-bar">
          <div
            className="progress-bar__fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="regular-text">
          {Number(progress.toFixed(2))}% накопичено
        </p>
      </div>
      {/* Дозволяє ввести суму, на яку потрібно змінити накопичення */}
      <input
        type="number"
        step="0.01"
        placeholder="Сума поповнення"
        className="add-wish-input"
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
      />
      {/* Зберігає змінену суму та оновлює прогрес-бар */}s
      <button
        type="button"
        className="purchased-btn"
        onClick={async () => {
          const success = await onSave(id, Number(amount));

          if (success) {
            setAmount('');
          }
        }}
      >
        Поповнити
      </button>
      {url !== '-' ? (
        <p className="regular-text">
          <a href={url} target="_blank" rel="noopener noreferrer">
            Переглянути товар
          </a>
        </p>
      ) : (
        <p className="regular-text">Посилання: —</p>
      )}
      <select
        className="priority-select"
        aria-label="Пріоритет бажання"
        value={priority}
        onChange={(event) => changePriority(id, event.target.value)}
      >
        <option value="low">Низький</option>
        <option value="medium">Середній</option>
        <option value="high">Високий</option>
      </select>
      <button className="purchased-btn" onClick={() => toggle(id)}>
        {completed ? 'Повернути в список' : 'Позначити як придбане'}
      </button>
    </article>
  );
}

const root = ReactDOM.createRoot(document.getElementById('app-root'));
root.render(<App />);

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem('wishList');

    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Помилка читання даних із localStorage:', error);
    return null;
  }
}

// Обчислює загальну суму всіх бажань у масиві та повертає результат
function getTotalCost(wishList) {
  let totalCost = 0;

  for (const wish of wishList) {
    totalCost += wish.price;
  }

  return totalCost;
}
