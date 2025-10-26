const textInput = document.getElementById("textInput");
const resultDiv = document.getElementById("result");

document.getElementById("checkBtn").addEventListener("click", async () => {
  const text = textInput.value;

  if (!text.trim()) {
    resultDiv.innerHTML = "<p>Silakan masukkan teks terlebih dahulu.</p>";
    return;
  }

  try {
    const response = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        text: text,
        language: "en-US" // bisa diganti "id" untuk bahasa Indonesia
      })
    });

    const data = await response.json();

    if (data.matches.length === 0) {
      resultDiv.innerHTML = "<p>Tidak ada kesalahan ditemukan 🎉</p>";
    } else {
      let output = "<ul>";
      data.matches.forEach((match, index) => {
        const wrongWord = text.substring(match.offset, match.offset + match.length);
        const suggestions = match.replacements.map(r => 
          `<span class="suggestion" data-offset="${match.offset}" data-length="${match.length}" data-value="${r.value}">${r.value}</span>`
        ).join(" ");

        output += `<li><b>${match.message}</b><br>
          <i>Salah:</i> ${wrongWord}<br>
          <i>Saran:</i> ${suggestions}</li><br>`;
      });
      output += "</ul>";
      resultDiv.innerHTML = output;

      // Tambahkan event listener untuk setiap saran
      document.querySelectorAll(".suggestion").forEach(s => {
        s.addEventListener("click", () => {
          const offset = parseInt(s.getAttribute("data-offset"));
          const length = parseInt(s.getAttribute("data-length"));
          const value = s.getAttribute("data-value");

          // Ganti teks di textarea
          const before = textInput.value.substring(0, offset);
          const after = textInput.value.substring(offset + length);
          textInput.value = before + value + after;

          // Refresh hasil setelah mengganti
          document.getElementById("checkBtn").click();
        });
      });
    }
  } catch (error) {
    resultDiv.innerHTML = "<p>Terjadi kesalahan saat memeriksa teks.</p>";
    console.error(error);
  }
});
