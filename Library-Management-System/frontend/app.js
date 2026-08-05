console.log("App.js Loaded Successfully");


const API = "http://127.0.0.1:8001";


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


        const table = document.getElementById("bookTable");


        if(!table){
            console.log("Book table not found");
            return;
        }


        table.innerHTML = "";


        books.forEach(book => {


            table.innerHTML += `

            <tr>

                <td>${book.id}</td>

                <td>${book.title}</td>

                <td>${book.author}</td>

                <td>${book.category}</td>

                <td>${book.quantity}</td>


                <td>

                    <button onclick="editBook(${book.id})">
                        ✏️ Edit
                    </button>


                    <button onclick="deleteBook(${book.id})">
                        🗑 Delete
                    </button>

                </td>


            </tr>

            `;


        });


    }
    catch(error){

        console.log("Load Books Error:", error);

    }

}



// =============================
// Add Book
// =============================
async function addBook(){


    const book = {


        title: document.getElementById("title").value,


        author: document.getElementById("author").value,


        category: document.getElementById("category").value,


        quantity: Number(
            document.getElementById("quantity").value
        )


    };



    try{


        const response = await fetch(`${API}/books`,{


            method:"POST",


            headers:{

                "Content-Type":"application/json"

            },


            body:JSON.stringify(book)


        });



        if(response.ok){


            alert("Book Added Successfully");


            closeModal();


            loadBooks();


        }
        else{

            alert("Book Add Failed");

        }



    }
    catch(error){

        console.log(error);

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
loadBooks();