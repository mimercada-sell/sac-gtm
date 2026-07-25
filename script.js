// Pega aqui la URL publicada de tu Google Apps Script
const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw3KO1Dx5d1phhCut9mg98uMRTqMbEKX8lzto9B1tXxTzNGAb23ftS_G8lZ5zWij-hZDQ/exec";


const form = document.querySelector("#orderForm");
const message = document.querySelector("#formMessage");
const submitButton = form.querySelector("button[type='submit']");

let isSubmitting = false;


function setMessage(text, type) {
  message.textContent = text;
  message.className = `form-message ${type || ""}`.trim();
}


function getTrackingParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    source: params.get("utm_source") || "Facebook",
    campaign: params.get("utm_campaign") || "Test1",
    adset: params.get("utm_term") || "Broad",
    ad: params.get("utm_content") || "Video1"
  };
}


function getPayload() {

  const data = new FormData(form);

  data.append("fecha", new Date().toISOString());

  data.append("pais", "Guatemala");
  data.append("producto", "Nuevo Producto");
  data.append("precio", "350");

  data.append("estado", "Nuevo");
  data.append("estado_pago", "Pago contra entrega");
  data.append("envio", "Gratis");


  // Facebook tracking
  const tracking = getTrackingParams();

  data.append("source", tracking.source);
  data.append("campaign", tracking.campaign);
  data.append("adset", tracking.adset);
  data.append("ad", tracking.ad);


  return data;
}



form.addEventListener("submit", async (event) => {

  event.preventDefault();


  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }


  // Prevent duplicate orders
  if (isSubmitting) {
    return;
  }

  isSubmitting = true;


  if (!SHEET_SCRIPT_URL) {

    setMessage(
      "Falta configurar la URL del Apps Script para enviar a Google Sheets.",
      "error"
    );

    isSubmitting = false;
    return;
  }


  // Disable button
  submitButton.disabled = true;
  submitButton.style.opacity = "0.6";
  submitButton.style.cursor = "not-allowed";
  submitButton.textContent = "Enviando pedido...";


  setMessage("Estamos guardando tu pedido.", "");



  try {

    await fetch(SHEET_SCRIPT_URL, {

      method: "POST",

      mode: "no-cors",

      body: getPayload(),

    });



    // Meta Pixel Lead
    if (typeof fbq === "function") {

      fbq("track", "Lead", {

        content_name: "Nuevo Producto",

        value: 350,

        currency: "GTQ"

      });

    }



    form.reset();

    alert("✅ Pedido enviado correctamente. Te contactaremos para confirmar la entrega.");



  } catch (error) {


    console.error(error);


    alert("❌ Error al enviar el pedido. Intenta de nuevo.");


  } finally {

  isSubmitting = false;

  submitButton.disabled = false;

  submitButton.style.opacity = "1";

  submitButton.style.cursor = "pointer";

  submitButton.textContent = "Enviar pedido";

}


});
