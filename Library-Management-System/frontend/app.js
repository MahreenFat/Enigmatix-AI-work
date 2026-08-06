console.log("App.js Loaded Successfully");


const API = "http://127.0.0.1:8000";
const AUTH_KEY = "libraryCurrentUser";

function getCurrentUser(){
    try{
        const raw = localStorage.getItem(AUTH_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch{
        return null;
    }
}

function setCurrentUser(user){
    if(user){
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
}

function clearCurrentUser(){
    localStorage.removeItem(AUTH_KEY);
}

function initAuth(){
    const user = getCurrentUser();
    const status = document.getElementById("userStatus");
    if(status){
        status.textContent = user ? `Signed in as ${user.name || user.email}` : "Not signed in";
    }

    if(!user){
        window.location.href = "login.html";
        return;
    }
}

function logout(){
    clearCurrentUser();
    window.location.href = "login.html";
}


// =============================
// Open Modal
// =============================
function openModal(){

    const modal = document.getElementById("bookModal");

    if(modal){
        modal.style.display = "block";
    }

}



// =============================
// Close Modal
// =============================
function closeModal(){

    const modal = document.getElementById("bookModal");

    if(modal){
        modal.style.display = "none";
    }

}



// =============================
// Load All Books
// =============================
async function loadBooks(){

    try{

        const response = await fetch(`${API}/books`);

        const books = await response.json();

        renderBooks(books);

    }
    catch(error){

        console.log("Load Books Error:", error);

    }

}

function renderBooks(books){
    const table = document.getElementById("bookTable");
    if(!table){
        console.log("Book table not found");
        return;
    }

    table.innerHTML = "";

    if (books.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding: 16px;">
                    No books found.
                </td>
            </tr>
        `;
    } else {
        books.forEach(book => {
            table.innerHTML += `
                <tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.category}</td>
                    <td>${book.quantity}</td>
                    <td>
                        <button type="button" onclick="editBook(${book.id})">
                            ✏️ Edit
                        </button>
                        <button type="button" onclick="deleteBook(${book.id})">
                            🗑 Delete
                        </button>
                    </td>
                </tr>
            `;
        });
    }

    const totalBooks = document.getElementById("totalBooks");
    if (totalBooks) {
        totalBooks.textContent = books.length;
    }
}

function clearBookForm() {
    document.getElementById("title").value = "";
    document.getElementById("author").value = "";
    document.getElementById("category").value = "";
    document.getElementById("quantity").value = "";
}

async function searchBook(){
    const keyword = document.getElementById("search").value.trim();

    if(!keyword){
        loadBooks();
        return;
    }

    try{
        const response = await fetch(`${API}/books/search/${encodeURIComponent(keyword)}`);
        const books = await response.json();
        renderBooks(books);
    }
    catch(error){
        console.log("Search Book Error:", error);
    }
}

// =============================
// Add Book
// =============================
async function addBook(){

    console.log("Add button clicked");

    const title = document.getElementById("title").value.trim();
    const author = document.getElementById("author").value.trim();
    const category = document.getElementById("category").value.trim();
    const quantityValue = document.getElementById("quantity").value.trim();

    if (!title || !author || !category || !quantityValue) {
        alert("Please fill in all book fields before adding.");
        return;
    }

    const quantity = Number(quantityValue);
    if (Number.isNaN(quantity) || quantity <= 0) {
        alert("Please enter a valid quantity greater than 0.");
        return;
    }

    const book = {
        title,
        author,
        category,
        quantity
    };

    try{


        const response = await fetch(`${API}/books`,{
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(book)
        });

        if(response.ok){
            alert("Book Added Successfully");
            clearBookForm();
            loadBooks();
        }
        else{
            const errorText = await response.text();
            alert("Book Add Failed: " + (errorText || response.statusText));
        }



    }
    catch(error){
        console.log(error);
        alert("Error adding book: " + (error.message || error));
    }

}




// =============================
// Delete Book
// =============================
async function deleteBook(id){


    const confirmDelete = confirm(
        "Are you sure you want to delete this book?"
    );


    if(confirmDelete){


        try{


            await fetch(`${API}/books/${id}`,{


                method:"DELETE"


            });



            alert("Book Deleted Successfully");


            loadBooks();


        }
        catch(error){

            console.log(error);

        }


    }


}



// =============================
// Edit Book
// =============================
function editBook(id){

    alert(
        "Edit feature will be added next. Book ID: " + id
    );

}



// =============================
// Run when page loads
// =============================
initAuth();
loadBooks();