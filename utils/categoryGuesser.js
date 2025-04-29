// utils/categoryGuesser.js

const keywordCategoryMap = {
    "market": "Market",
    "bim": "Market",
    "a101": "Market",
    "migros": "Market",
    "fatura": "Fatura",
    "elektrik": "Fatura",
    "su": "Fatura",
    "doğalgaz": "Fatura",
    "yemek": "Yemek",
    "restoran": "Yemek",
    "kira": "Kira",
    "maaş": "Gelir",
    "ek gelir": "Gelir",
    "internet": "Fatura",
    "kredi kartı": "Banka",
    "benzin": "Ulaşım",
    "ulaşım": "Ulaşım",
};

function guessCategory(description = "") {
    const desc = description.toLowerCase();

    for (const keyword in keywordCategoryMap) {
        if (desc.includes(keyword)) {
            return keywordCategoryMap[keyword];
        }
    }

    return "Diğer"; // eşleşme yoksa varsayılan kategori
}

export default guessCategory;
