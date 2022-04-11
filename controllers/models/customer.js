const express = require("express");

const dbHandler = require("../databaseHandler");
const router = express.Router();
router.use(express.static("public"));

const searchInput = req.query.searchInput;
if (isNaN(Number.parseFloat(searchInput)) == false) {
  await SearchObject(
    req,
    searchInput,
    res,
    dbHandler.searchObjectbyPrice,
    "Book",
    Number.parseFloat(searchInput),
    " VND"
  );
} else {
  await SearchObject(
    req,
    searchInput,
    res,
    dbHandler.searchObjectbyName,
    "Book",
    searchInput,
    ""
  );
}

async function SearchObject(
req,
searchInput,
res,
dbFunction,
collectionName,
searchInput,
mess
) {
const resultSearch = await dbFunction(collectionName, searchInput);
if (resultSearch.length != 0) {
  if (!req.session.user) {
    res.render("search", {
      searchBook: resultSearch,
    });
  } else {
    res.render("search", {
      searchBook: resultSearch,
      user: req.session.user,
    });
  }
} else {
  if (!req.session.user) {
    const message = "Not found " + searchInput + mess;
    res.render("search", {
      errorSearch: message,
    });
  } else {
    const message = "Not found " + searchInput + mess;
    res.render("search", {
      truyens: truyen,
      ITbooks: ITbook,
      errorSearch: message,
      user: req.session.user,
    });
  }
}
}
