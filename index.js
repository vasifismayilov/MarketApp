const newNameInput = document.querySelector("#new-product-name");
const newCodeInput = document.querySelector("#new-product-code");
const newPriceInput = document.querySelector('#new-product-price')
const newProductDate = document.querySelector("#new-product-date");
const addProductButton = document.querySelector("#add-product");
const listElement = document.querySelector('.list')
const searchInput = document.querySelector('#search')
const selectedContentElement = document.querySelector('tbody')
const acceptButton = document.querySelector('.accept')
const discardButton = document.querySelector('.discard')
const notfElement = document.querySelector('.notf')


// state
let products = [
    // {
    //     name: '',
    //     code: '',
    //     date: '',
    // }
];

let selectedProducts = []

let generalIncome = 0

// Utilities

function syncProductsWithStorage() {
    const jsonProducts = JSON.stringify(products)
    localStorage.setItem('products', jsonProducts)
}

function changeTotalPrice(price) {
    document.querySelector('#result').textContent = price
}

function changeGeneralIncome() {
    localStorage.setItem('generalIncome', generalIncome)
    document.querySelector('#general-income').textContent = generalIncome.toFixed(2)
}

function hideNotf() {
    notfElement.classList.remove('notf-show')
}

function showNotf(message) {
    notfElement.firstElementChild.textContent = message
    notfElement.classList.add('notf-show')
    setTimeout(() => {
        hideNotf();
    }, 3000);
}

function createProduct(productInfo) {
    const listItem = document.createElement('div')
    const listContent = document.createElement('div')
    const deleteIcon = document.createElement('i')
    listItem.className = 'list-item'
    listContent.className = 'list-content'
    deleteIcon.className = 'fa-solid fa-trash'
    listItem.id = productInfo.code
    listContent.textContent = productInfo.name
    listItem.setAttribute('date-data', productInfo.date)
    listItem.setAttribute('title-data', productInfo.name)
    listItem.setAttribute('price-data', productInfo.price)
    listItem.append(listContent, deleteIcon)
    listItem.onmouseenter = mouseEnterHandler
    listItem.onmouseleave = mouseLeaveHandler
    listItem.onclick = listItemClickHandler;
    deleteIcon.onclick = deleteProduct;
    return listItem
}
function setProductsToListElement(customProducts) {
    listElement.innerHTML = ''
    const selectedArray = customProducts ? customProducts : products
    selectedArray.forEach(productInfo => {
        const productElement = createProduct(productInfo)
        listElement.appendChild(productElement)
    })
}


function createSelectedRowElement(selectedProductInfo) {
    const tr = document.createElement('tr')
    const indexElement = document.createElement('td')
    indexElement.textContent = selectedProductInfo.index
    const nameElement = document.createElement('td')
    nameElement.textContent = selectedProductInfo.name
    const codeElement = document.createElement('td')
    codeElement.textContent = selectedProductInfo.code
    const dateElement = document.createElement('td')
    dateElement.textContent = selectedProductInfo.date
    const priceElement = document.createElement('td')
    priceElement.textContent = selectedProductInfo.price + ' AZN'
    const countElement = document.createElement('td')
    countElement.textContent = selectedProductInfo.count
    tr.append(indexElement, nameElement, codeElement, dateElement, priceElement, countElement)
    return tr
}

function setSelectedProductsToContentElement() {
    selectedContentElement.innerHTML = '';
    selectedProducts.forEach(selectedInfo => {
        const rowElement = createSelectedRowElement(selectedInfo)
        selectedContentElement.append(rowElement)
    })
}

function caluclateTotalPrice() {
    const result = selectedProducts.reduce((prev, cur) => {
        return prev + (cur.count * cur.price)
    }, 0)
    return result.toFixed(2)
}

function addProductToSelected(codeId) {
    const requestedProduct = products.find(e => e.code === codeId)
    const productDate = new Date(requestedProduct.date)
    const dateDifference = Date.now() - productDate.getTime()
    const differenceDays = Math.round(dateDifference / 86400000)
    if (differenceDays > 0) {
        alert(`Bu mehsulun vaxtindan ${differenceDays} gun kecmisir!`)
        return;
    } else if (differenceDays > -6) {
        showNotf(`Bu mehsulun vaxtinin bitmesine ${Math.abs(differenceDays)} gun qalib!`)
    }
    const productIndex = selectedProducts.findIndex(e => e.code === codeId)
    if (productIndex === -1) {
        const newSelectedProduct = Object.assign({}, requestedProduct)
        newSelectedProduct.index = selectedProducts.length + 1
        newSelectedProduct.count = 1
        selectedProducts.push(newSelectedProduct)
    } else {
        const selectedProduct = selectedProducts[productIndex];
        selectedProduct.count++
    }
    setSelectedProductsToContentElement();
    changeTotalPrice(caluclateTotalPrice())
}



// Event Callbacks
function addNewProductHandler(event) {
    event.preventDefault();
    const newProductInfo = {
        name: newNameInput.value,
        code: newCodeInput.value,
        price: newPriceInput.value,
        date: newProductDate.value,
    }
    newNameInput.value = ''
    newCodeInput.value = ''
    newPriceInput.value = ''
    newProductDate.value = ''
    products.push(newProductInfo)
    syncProductsWithStorage()
    setProductsToListElement();
}

function listItemClickHandler() {
    const code = this.id;
    addProductToSelected(code)
}

function loadProductsHandler() {
    const storedProducts = localStorage.getItem('products')
    const storedGeneralIncome = localStorage.getItem('generalIncome')
    if (storedProducts) {
        products = JSON.parse(storedProducts)
        setProductsToListElement();
    } else {
        localStorage.setItem('products', JSON.stringify(products))
    }

    if (storedGeneralIncome) {
        generalIncome = JSON.parse(storedGeneralIncome);
        changeGeneralIncome(generalIncome)
    } else {
        localStorage.setItem('generalIncome', JSON.stringify(generalIncome))
    }

}

function mouseEnterHandler(e) {
    this.firstElementChild.textContent = this.id
}

function mouseLeaveHandler(e) {
    this.firstElementChild.textContent = this.getAttribute('title-data')
}

function searchHandler(e) {
    const value = searchInput.value;
    const filteredProducts = products.filter(productInfo => {
        return productInfo.code.startsWith(value);
    })
    setProductsToListElement(filteredProducts)
}

function searchSubmitHandler(e) {
    if (e.keyCode === 13) {
        const firstListItem = listElement.firstElementChild;
        const code = firstListItem.id
        addProductToSelected(code);
        searchInput.value = ''
        setProductsToListElement();
    }
}

function deleteProduct(e) {
    e.stopPropagation()
    const code = e.target.parentElement.id
    products = products.filter(productInfo => {
        return productInfo.code !== code
    })
    setProductsToListElement()
    syncProductsWithStorage()
}

function acceptSelectedProducts(e) {
    selectedContentElement.innerHTML = ''
    const totalPrice = caluclateTotalPrice();
    selectedProducts = []
    generalIncome += Number(totalPrice);
    changeGeneralIncome()
    changeTotalPrice(0)
}

function discardSelectedProducts(e) {
    selectedProducts = []
    selectedContentElement.innerHTML = ''
    changeTotalPrice(0)
}

// Events
addProductButton.onclick = addNewProductHandler
window.addEventListener('load', loadProductsHandler)
searchInput.addEventListener('input', searchHandler)
searchInput.addEventListener('keydown', searchSubmitHandler)
acceptButton.addEventListener('click', acceptSelectedProducts)
discardButton.addEventListener('click', discardSelectedProducts)
notfElement.lastElementChild.addEventListener('click', hideNotf)
