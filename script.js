document.addEventListener("DOMContentLoaded", () => {
    const imageInput = document.getElementById("imageInput");
    const memeImage = document.getElementById("memeImage");

    const topText = document.getElementById("topText");
    const textTop = document.getElementById("textTop");
    const bottomText = document.getElementById("bottomText");
    const textBottom = document.getElementById("textBottom");

    const downloadBtn = document.getElementById("downloadBtn");
    const clearHistoryBtn = document.getElementById("clearHistoryBtn");

    const textColor = document.getElementById("textColor");
    const textSize = document.getElementById("textSize");
    const filterSelect = document.getElementById("filterSelect");

    const historyGallery = document.getElementById("historyGallery");

    if (!historyGallery) {
        console.error("L'élément 'historyGallery' n'a pas été trouvé dans le HTML !");
        return;
    }

    // Load history from LocalStorage
    function loadHistory() {
        const savedMemes = JSON.parse(localStorage.getItem("memeHistory")) || [];
        historyGallery.innerHTML = "";
        
        if (savedMemes.length === 0) {
            historyGallery.innerHTML = `
                <div class="empty-state">
                    <p>Aucune création pour le moment.<br>Tes futurs chefs-d'œuvre apparaîtront ici après téléchargement.</p>
                </div>`;
            return;
        }

        savedMemes.forEach((memeData, index) => {
            const card = document.createElement("div");
            card.className = "meme-card";
            
            card.innerHTML = `
                <img src="${memeData}" alt="Meme ${index + 1}">
                <div class="meme-card-actions">
                    <button class="btn-mini btn-download" data-index="${index}">
                        Exporter
                    </button>
                    <button class="btn-mini btn-delete" data-index="${index}" title="Supprimer">
                        ✕
                    </button>
                </div>
            `;
            
            // Re-download from history
            card.querySelector(".btn-download").addEventListener("click", () => {
                const link = document.createElement("a");
                link.href = memeData;
                link.download = `mon-meme-${index + 1}.png`;
                link.click();
            });

            // Delete specific item
            card.querySelector(".btn-delete").addEventListener("click", () => {
                if(confirm("Supprimer cette création de l'historique ?")) {
                    const memes = JSON.parse(localStorage.getItem("memeHistory")) || [];
                    memes.splice(index, 1);
                    localStorage.setItem("memeHistory", JSON.stringify(memes));
                    loadHistory();
                }
            });

            historyGallery.prepend(card);
        });
    }

    function saveToHistory(imageData) {
        const savedMemes = JSON.parse(localStorage.getItem("memeHistory")) || [];
        savedMemes.push(imageData);
        localStorage.setItem("memeHistory", JSON.stringify(savedMemes));
        loadHistory();
    }

    clearHistoryBtn.addEventListener("click", () => {
        if(confirm("Es-tu sûr de vouloir effacer tout ton historique ?")) {
            localStorage.removeItem("memeHistory");
            loadHistory();
        }
    });

    imageInput.addEventListener("change", function(){
        const file = this.files[0];
        if(file){
            const reader = new FileReader();
            reader.onload = function(event){
                memeImage.src = event.target.result;
            }
            reader.readAsDataURL(file);
        }
    });

    topText.addEventListener("input", function(){
        textTop.innerText = topText.value;
    });

    bottomText.addEventListener("input", function(){
        textBottom.innerText = bottomText.value;
    });

    textColor.addEventListener("input", () => {
        textTop.style.color = textColor.value;
        textBottom.style.color = textColor.value;
    });

    textSize.addEventListener("input", () => {
        textTop.style.fontSize = textSize.value + "px";
        textBottom.style.fontSize = textSize.value + "px";
    });

    filterSelect.addEventListener("change", () => {
        memeImage.style.filter = filterSelect.value;
    });

    const templates = document.querySelectorAll(".template");
    templates.forEach(template => {
        template.addEventListener("click", () => {
            // Update image source
            memeImage.src = template.src;
            
            // Handle visual selected state
            templates.forEach(t => t.classList.remove("selected"));
            template.classList.add("selected");
        });
    });

    downloadBtn.addEventListener("click", async () => {
        const memeContainer = document.querySelector(".meme-container");
        const oldBoxShadow = memeContainer.style.boxShadow;
        memeContainer.style.boxShadow = "none";

        try {
            const canvas = await html2canvas(memeContainer, {
                backgroundColor: null,
                useCORS: true
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = "mon-meme.png";
            link.click();

            memeContainer.style.boxShadow = oldBoxShadow;
            saveToHistory(image);
        } catch (error) {
            console.error("Erreur lors de la génération :", error);
        }
    });

    // Drag and Drop Logic
    function makeDraggable(element) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        element.addEventListener("mousedown", dragStart);
        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", dragEnd);

        element.addEventListener("touchstart", dragStart);
        document.addEventListener("touchmove", drag);
        document.addEventListener("touchend", dragEnd);

        function dragStart(e) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }
            if (e.target === element) { isDragging = true; }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }
                xOffset = currentX;
                yOffset = currentY;
                setTranslate(currentX, currentY, element);
            }
        }

    function setTranslate(xPos, yPos, el) {
        // We keep the centerX transform from CSS and add the drag offset
        // Using top/bottom logic for initial placement and yPos for drag
        const initialY = el.id === "textTop" ? "20px" : "calc(100% - 60px)";
        el.style.transform = `translate(calc(-50% + ${xPos}px), ${yPos}px)`;
    }

        function dragEnd() {
            initialX = currentX;
            initialY = currentY;
            isDragging = false;
        }
    }

    makeDraggable(textTop);
    makeDraggable(textBottom);

    // Social Media Share
    const whatsappBtn = document.getElementById("whatsappBtn");
    const facebookBtn = document.getElementById("facebookBtn");
    const twitterBtn = document.getElementById("twitterBtn");

    function getShareMessage() {
        return "Regarde le mème que je viens de créer avec Meme Studio ! 😎";
    }

    whatsappBtn.addEventListener("click", () => {
        const text = encodeURIComponent(getShareMessage());
        window.open(`https://wa.me/?text=${text}`, "_blank");
    });

    facebookBtn.addEventListener("click", () => {
        // Facebook sharer mostly works with URLs, so we point to a generic placeholder or the app
        const url = encodeURIComponent(window.location.href);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    });

    twitterBtn.addEventListener("click", () => {
        const text = encodeURIComponent(getShareMessage());
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    });

    loadHistory();
});