let BASE_URL="http://127.0.0.1:8000/";
fetch(BASE_URL)
  .then(response => response.json())
  .then(data => {
    console.log(data);
    document.getElementById("output").innerText = data.message;
  })
  .catch(error => console.error("Error:", error));