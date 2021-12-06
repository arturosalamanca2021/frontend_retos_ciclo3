const BASE_URL      = 'http://localhost:8080/api'; //'http://144.22.236.244:8080/api';
const DATA_TYPE     = 'json';
const CONTENT_TYPE  = 'application/json';
const METHOD_POST   = 'POST';
const METHOD_GET    = 'GET';
const METHOD_PUT    = 'PUT';
const METHOD_DELETE = 'DELETE';
var currentSource   = "";
var isNewRecord     = true;

$(document).ready(() => {
    $(`.section`).hide();
})

/**
 * Cambia de formulario
 * @param {*} tag 
 */
function toggleSection(tag, autoSearch = true){
    $(`.section`).hide();
    $(`.section-${tag}`).show();
    currentSource = tag;
    isNewRecord = true;
    $(`#id_${currentSource}`).prop("readOnly", false);
    if(autoSearch)
        getItems();
}

/**
 * metodo para envio de peticiones a la base de datos
 * @param {*} options 
 * @param {*} callback 
 */
function sendRequest(options, callback){
    $.ajax({
        dataType: DATA_TYPE,
        data: options.data,
        url: `${BASE_URL}/${options.url ?? capitalize(currentSource)}`,
        contentType: CONTENT_TYPE,
        type: options.method,
        success: callback,
        statusCode: {
            201: function() { 
                resetForm();
                getItems();
            }
        },
        error: function(jqXHR, textStatus, errorThrown){ }
    })
}

/**
 * obtiene los registros y carga en la tabla
 */
function getItems(){
    let options = {
        method: METHOD_GET,
        data: [],
        url: `${capitalize(currentSource)}/all`     
    }
    let callback = function(res){
        var misItems = res;
        $(`#tbody-${currentSource}`).html("");
        for(i = 0; i < misItems.length; i++){
            $(`#tbody-${currentSource}`).append("<tr>");
            for (const [key, value] of Object.entries(misItems[i])) {
                $(`#tbody-${currentSource}`).append(`<td>${typeof value === 'object' && value !== null ? value.name ?? '' : value }</td>`);
            }
            if(misItems[i].id === undefined){
                misItems[i].id = misItems[i][`id${capitalize(currentSource)}`]            
            }
            $(`#tbody-${currentSource}`).append('<td><button onclick="deleteItem('+misItems[i].id+')" class="btn btn-danger">Borrar</button></td>');
            $(`#tbody-${currentSource}`).append('<td><button onclick="getItemById('+misItems[i].id+')" class="btn btn-warning">Cargar</button></td>');
            $(`#tbody-${currentSource}`).append("</tr>");
        }
    } 
    sendRequest(options, callback);
}

/**
 * 
 * @param {*} idItem 
 */
function deleteItem(idItem){
    var r = confirm("¿Esta seguro de eliminar este elemento?");
    if (r == true) {
        let options = {
            method: METHOD_DELETE,
            data: [],
            url: `${capitalize(currentSource)}/${idItem}`
        }
        let callback = function(res){
            getItems();
        }
        sendRequest(options, callback);    
    } 
}
    
/**
 * obtiene registro por id de la base de datos
 * @param {*} idItem 
 */
function getItemById(idItem){
    $(`#id_${currentSource}`).prop("readOnly", true);
    let options = {
        url: `${capitalize(currentSource)}/${idItem}`,
        method: METHOD_GET
    }

    let callback = function(response) {
        var item = response;
        for (const [key, value] of Object.entries(item)) {
            console.log(`#${key}_${currentSource}`);
            $(`#${key}_${currentSource}`).val(value);
        }
        isNewRecord = false;
    }
    sendRequest(options, callback);
}

/**
 * guarda el registro o actualiza
 */
function saveItem(){
    let item = getItem();
    let options = {
        method: isNewRecord ? METHOD_POST : METHOD_PUT,
        data: JSON.stringify(item),
        url: `${capitalize(currentSource)}/${isNewRecord ? "save": "update"}`     
    }
    
    let callback = function(res){
        getItems();
    }
    sendRequest(options, callback);
}

/**
 * obtiene objeto de acuerdo al formulario seleccionado
 * @returns 
 */
function getItem(){
    let objectRes = { 
        id : isNewRecord ? 0 : parseInt($(`#id_${currentSource}`).val())
    }
    switch(currentSource){
        case "client":
            objectRes.idClient  = parseInt($(`#idClient_${currentSource}`).val());
            objectRes.name      = $(`#name_${currentSource}`).val();
            objectRes.email     = $(`#email_${currentSource}`).val();
            objectRes.password  = $(`#password_${currentSource}`).val();
            objectRes.age       = parseInt($(`#age_${currentSource}`).val());
        break;
        case "costume":
            objectRes.name      = $(`#name_${currentSource}`).val();
            objectRes.brand     = $(`#brand_${currentSource}`).val();
            objectRes.year      = parseInt($(`#year_${currentSource}`).val());
            objectRes.category  = { id: parseInt($(`#category_id_${currentSource}`).val())};
        break;
        case "message":
            objectRes.idMessage     = parseInt($(`#idMessage_${currentSource}`).val());
            objectRes.messageText   = $(`#messageText_${currentSource}`).val();
        break;
        case "category":
            objectRes.name        = $(`#name_${currentSource}`).val();
            objectRes.description = $(`#description_${currentSource}`).val();
        break;
        case "reservation":
            objectRes.idReservation   = parseInt($(`#idReservation_${currentSource}`).val());
            objectRes.status          = $(`#status_${currentSource}`).val();
            objectRes.startDate       = $(`#startDate_${currentSource}`).val();
            objectRes.devolutionDate  = $(`#devolutionDate_${currentSource}`).val();
        break;
    }
    console.log(objectRes);
    return objectRes;
}

/**
 * Obtener reservaciones por fechas
 */
function getReservationByDates(){
    startDate   = $(`#startDate_${currentSource}`).val();
    endDate     = $(`#endDate_${currentSource}`).val();
    let options = {
        method: METHOD_GET,
        data: [],
        url: `Reservation/report-dates/${startDate}/${endDate}`     
    }
    let callback = function(res){
        $(`#tbody-${currentSource}`).html("");
        for(i = 0; i < res.length; i++){
            $(`#tbody-${currentSource}`).append("<tr>");
            for (const [key, value] of Object.entries(res[i])) {
                $(`#tbody-${currentSource}`).append(`<td>${typeof value === 'object' && value !== null ? value.name ?? '' : value }</td>`);
            }
        }
    }
    sendRequest(options, callback);
}

function getReservationCount(){
    let options = {
        method: METHOD_GET,
        data: [],
        url: `Reservation/report-status`     
    }
    let callback = function(res){
        $(`#count_completed_${currentSource}`).val(res.completed ?? 0);
        $(`#count_cancelled_${currentSource}`).val(res.cancelled ?? 0);
    }
    sendRequest(options, callback);
}

/**
 * resetea el formulario indicado
 */
function resetForm(){
    let item = getItem()
    for (const [key, value] of Object.entries(item)) {
        $(`#${key}_${currentSource}`).val("");
    }
}

// utils capitalize
function capitalize(word) {
    const lower = word.toLowerCase();
    return word.charAt(0).toUpperCase() + lower.slice(1);
}
  