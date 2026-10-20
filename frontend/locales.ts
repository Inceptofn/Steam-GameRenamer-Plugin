export interface LocaleStrings {
    renameTitle: string;
    renameDescription: string;
    save: string;
    renameCurrent: string;
    setCustomName: string;
    options: string;
    sortLabel: string;
    sortDescription: string;
    yourRenames: string;
    noCustomNames: string;
}

const translations: Record<string, LocaleStrings> = {
    schinese: {
        renameTitle: "重命名“{name}”",
        renameDescription: "输入您想要显示的名称：",
        save: "保存",
        renameCurrent: "重命名：“{name}”",
        setCustomName: "设置自定义名称…",
        options: "选项",
        sortLabel: "按自定义名称排序库",
        sortDescription:
            "重命名游戏时设置 Steam 的排序字段。关闭此选项可停止影响库的排序顺序。",
        yourRenames: "您的重命名 ({count})",
        noCustomNames:
            "尚无自定义名称——右键单击游戏并选择“设置自定义名称…”即可添加。",
    },
    tchinese: {
        renameTitle: "重新命名「{name}」",
        renameDescription: "輸入您想要顯示的名稱：",
        save: "儲存",
        renameCurrent: "重新命名：「{name}」",
        setCustomName: "設定自訂名稱…",
        options: "選項",
        sortLabel: "依自訂名稱排序游戲庫",
        sortDescription:
            "重新命名遊戲時設定 Steam 的排序欄位。關閉此選項可停止影響遊戲庫的排序順序。",
        yourRenames: "您的重新命名 ({count})",
        noCustomNames:
            "尚無自訂名稱——在遊戲上按下滑鼠右鍵，然後選擇「設定自訂名稱…」即可新增。",
    },
    japanese: {
        renameTitle: "「{name}」の名前を変更",
        renameDescription: "代わりに表示する名前を入力してください：",
        save: "保存",
        renameCurrent: "名前を変更：「{name}」",
        setCustomName: "カスタム名を設定…",
        options: "オプション",
        sortLabel: "カスタム名でライブラリを並べ替え",
        sortDescription:
            "ゲーム名を変更すると Steam の並べ替えフィールドも設定します。オフにするとライブラリの並び順に影響しなくなります。",
        yourRenames: "変更した名前 ({count})",
        noCustomNames:
            "カスタム名はまだありません——ゲームを右クリックし、「カスタム名を設定…」を選択して追加します。",
    },
    koreana: {
        renameTitle: '"{name}" 이름 바꾸기',
        renameDescription: "대신 표시할 이름을 입력하세요:",
        save: "저장",
        renameCurrent: '이름 바꾸기: "{name}"',
        setCustomName: "사용자 지정 이름 설정…",
        options: "옵션",
        sortLabel: "사용자 지정 이름으로 라이브러리 정렬",
        sortDescription:
            "게임 이름을 바꿀 때 Steam의 정렬 필드를 설정합니다. 라이브러리 정렬 순서에 영향을 주지 않으려면 끄세요.",
        yourRenames: "변경한 이름 ({count})",
        noCustomNames:
            "사용자 지정 이름이 아직 없습니다. 게임을 오른쪽 클릭하고 “사용자 지정 이름 설정…”을 선택하세요.",
    },
    thai: {
        renameTitle: 'เปลี่ยนชื่อ "{name}"',
        renameDescription: "ป้อนชื่อที่คุณต้องการให้แสดงแทน:",
        save: "บันทึก",
        renameCurrent: 'เปลี่ยนชื่อ: "{name}"',
        setCustomName: "ตั้งชื่อกำหนดเอง…",
        options: "ตัวเลือก",
        sortLabel: "จัดเรียงคลังตามชื่อกำหนดเอง",
        sortDescription:
            "กำหนดช่องการจัดเรียงของ Steam เมื่อคุณเปลี่ยนชื่อเกม ปิดเพื่อไม่ให้กระทบลำดับการจัดเรียงของคลัง",
        yourRenames: "ชื่อที่คุณเปลี่ยน ({count})",
        noCustomNames:
            "ยังไม่มีชื่อกำหนดเอง — คลิกขวาที่เกมและเลือก “ตั้งชื่อกำหนดเอง…” เพื่อเพิ่ม",
    },
    bulgarian: {
        renameTitle: "Преименуване на „{name}“",
        renameDescription:
            "Въведете името, което искате да се показва вместо него:",
        save: "Запазване",
        renameCurrent: "Преименуване: „{name}“",
        setCustomName: "Задаване на персонализирано име…",
        options: "Опции",
        sortLabel: "Сортиране на библиотеката по персонализирано име",
        sortDescription:
            "Задава полето за сортиране на Steam при преименуване на игра. Изключете, за да спрете да влияете на реда на библиотеката.",
        yourRenames: "Вашите преименувания ({count})",
        noCustomNames:
            "Все още няма персонализирани имена — щракнете с десния бутон върху игра и изберете „Задаване на персонализирано име…“.",
    },
    czech: {
        renameTitle: "Přejmenovat „{name}“",
        renameDescription:
            "Zadejte název, který se má zobrazovat místo původního:",
        save: "Uložit",
        renameCurrent: "Přejmenovat: „{name}“",
        setCustomName: "Nastavit vlastní název…",
        options: "Možnosti",
        sortLabel: "Seřadit knihovnu podle vlastního názvu",
        sortDescription:
            "Při přejmenování hry nastaví pole řazení služby Steam. Vypnutím přestanete ovlivňovat pořadí knihovny.",
        yourRenames: "Vaše přejmenování ({count})",
        noCustomNames:
            "Zatím nejsou nastaveny žádné vlastní názvy — klikněte pravým tlačítkem na hru a vyberte „Nastavit vlastní název…“.",
    },
    danish: {
        renameTitle: 'Omdøb "{name}"',
        renameDescription: "Indtast det navn, du vil vise i stedet:",
        save: "Gem",
        renameCurrent: 'Omdøb: "{name}"',
        setCustomName: "Angiv brugerdefineret navn…",
        options: "Indstillinger",
        sortLabel: "Sortér bibliotek efter brugerdefineret navn",
        sortDescription:
            "Indstiller Steams sorteringsfelt, når du omdøber et spil. Slå fra for ikke længere at påvirke bibliotekets sorteringsrækkefølge.",
        yourRenames: "Dine omdøbninger ({count})",
        noCustomNames:
            "Ingen brugerdefinerede navne endnu — højreklik på et spil, og vælg „Angiv brugerdefineret navn…“ for at tilføje et.",
    },
    german: {
        renameTitle: "„{name}“ umbenennen",
        renameDescription:
            "Gib den Namen ein, der stattdessen angezeigt werden soll:",
        save: "Speichern",
        renameCurrent: "Umbenennen: „{name}“",
        setCustomName: "Benutzerdefinierten Namen festlegen…",
        options: "Optionen",
        sortLabel: "Bibliothek nach benutzerdefiniertem Namen sortieren",
        sortDescription:
            "Legt beim Umbenennen eines Spiels das Steam-Sortierfeld fest. Deaktivieren, um die Sortierreihenfolge der Bibliothek nicht mehr zu beeinflussen.",
        yourRenames: "Deine Umbenennungen ({count})",
        noCustomNames:
            "Noch keine benutzerdefinierten Namen – rechtsklicke auf ein Spiel und wähle „Benutzerdefinierten Namen festlegen…“.",
    },
    english: {
        renameTitle: 'Rename "{name}"',
        renameDescription: "Enter the name you'd like to display instead:",
        save: "Save",
        renameCurrent: 'Rename: "{name}"',
        setCustomName: "Set custom name…",
        options: "Options",
        sortLabel: "Sort library by custom name",
        sortDescription:
            "Sets Steam's sort-as field when you rename a game. Turn off to stop affecting library sort order.",
        yourRenames: "Your renames ({count})",
        noCustomNames:
            "No custom names yet — right-click a game and choose Set custom name… to add one.",
    },
    spanish: {
        renameTitle: "Cambiar el nombre de «{name}»",
        renameDescription:
            "Introduce el nombre que quieres mostrar en su lugar:",
        save: "Guardar",
        renameCurrent: "Cambiar nombre: «{name}»",
        setCustomName: "Establecer nombre personalizado…",
        options: "Opciones",
        sortLabel: "Ordenar la biblioteca por nombre personalizado",
        sortDescription:
            "Establece el campo de ordenación de Steam al cambiar el nombre de un juego. Desactívalo para dejar de modificar el orden de la biblioteca.",
        yourRenames: "Tus cambios de nombre ({count})",
        noCustomNames:
            "Aún no hay nombres personalizados. Haz clic derecho en un juego y elige «Establecer nombre personalizado…» para añadir uno.",
    },
    latam: {
        renameTitle: "Cambiar el nombre de «{name}»",
        renameDescription: "Ingresa el nombre que quieres mostrar en su lugar:",
        save: "Guardar",
        renameCurrent: "Cambiar nombre: «{name}»",
        setCustomName: "Establecer nombre personalizado…",
        options: "Opciones",
        sortLabel: "Ordenar la biblioteca por nombre personalizado",
        sortDescription:
            "Establece el campo de orden de Steam al cambiar el nombre de un juego. Desactívalo para dejar de modificar el orden de la biblioteca.",
        yourRenames: "Tus cambios de nombre ({count})",
        noCustomNames:
            "Aún no hay nombres personalizados. Haz clic derecho en un juego y elige «Establecer nombre personalizado…» para agregar uno.",
    },
    greek: {
        renameTitle: "Μετονομασία «{name}»",
        renameDescription:
            "Εισαγάγετε το όνομα που θέλετε να εμφανίζεται αντί αυτού:",
        save: "Αποθήκευση",
        renameCurrent: "Μετονομασία: «{name}»",
        setCustomName: "Ορισμός προσαρμοσμένου ονόματος…",
        options: "Επιλογές",
        sortLabel: "Ταξινόμηση της συλλογής κατά προσαρμοσμένο όνομα",
        sortDescription:
            "Ορίζει το πεδίο ταξινόμησης του Steam όταν μετονομάζετε ένα παιχνίδι. Απενεργοποιήστε το για να μην επηρεάζεται πλέον η σειρά της συλλογής.",
        yourRenames: "Οι μετονομασίες σας ({count})",
        noCustomNames:
            "Δεν υπάρχουν ακόμη προσαρμοσμένα ονόματα — κάντε δεξί κλικ σε ένα παιχνίδι και επιλέξτε «Ορισμός προσαρμοσμένου ονόματος…».",
    },
    french: {
        renameTitle: "Renommer « {name} »",
        renameDescription:
            "Écrivez le nom que vous souhaitez afficher à la place :",
        save: "Enregistrer",
        renameCurrent: "Renommer : « {name} »",
        setCustomName: "Définir un nom personnalisé…",
        options: "Options",
        sortLabel: "Trier la bibliothèque par nom personnalisé",
        sortDescription:
            "Définit le champ de tri de Steam lorsque vous renommez un jeu. Désactivez cette option pour ne plus modifier l’ordre de la bibliothèque.",
        yourRenames: "Vos renommages ({count})",
        noCustomNames:
            "Aucun nom personnalisé pour le moment — faites un clic droit sur un jeu et choisissez « Définir un nom personnalisé… » pour en ajouter un.",
    },
    indonesian: {
        renameTitle: 'Ganti nama "{name}"',
        renameDescription:
            "Masukkan nama yang ingin ditampilkan sebagai gantinya:",
        save: "Simpan",
        renameCurrent: 'Ganti nama: "{name}"',
        setCustomName: "Tetapkan nama khusus…",
        options: "Opsi",
        sortLabel: "Urutkan pustaka berdasarkan nama khusus",
        sortDescription:
            "Mengatur kolom pengurutan Steam saat Anda mengganti nama game. Nonaktifkan agar tidak lagi memengaruhi urutan pustaka.",
        yourRenames: "Nama yang Anda ubah ({count})",
        noCustomNames:
            "Belum ada nama khusus — klik kanan game dan pilih “Tetapkan nama khusus…” untuk menambahkannya.",
    },
    italian: {
        renameTitle: "Rinomina «{name}»",
        renameDescription:
            "Inserisci il nome che desideri visualizzare al suo posto:",
        save: "Salva",
        renameCurrent: "Rinomina: «{name}»",
        setCustomName: "Imposta nome personalizzato…",
        options: "Opzioni",
        sortLabel: "Ordina la libreria per nome personalizzato",
        sortDescription:
            "Imposta il campo di ordinamento di Steam quando rinomini un gioco. Disattiva per non modificare più l’ordine della libreria.",
        yourRenames: "Le tue rinomine ({count})",
        noCustomNames:
            "Nessun nome personalizzato — fai clic destro su un gioco e scegli «Imposta nome personalizzato…» per aggiungerne uno.",
    },
    hungarian: {
        renameTitle: "„{name}” átnevezése",
        renameDescription: "Adja meg a helyette megjelenítendő nevet:",
        save: "Mentés",
        renameCurrent: "Átnevezés: „{name}”",
        setCustomName: "Egyéni név beállítása…",
        options: "Beállítások",
        sortLabel: "Könyvtár rendezése egyéni név szerint",
        sortDescription:
            "A játék átnevezésekor beállítja a Steam rendezési mezőjét. Kapcsolja ki, hogy ne befolyásolja a könyvtár sorrendjét.",
        yourRenames: "Átnevezések ({count})",
        noCustomNames:
            "Még nincsenek egyéni nevek — kattintson jobb gombbal egy játékra, majd válassza az „Egyéni név beállítása…” lehetőséget.",
    },
    dutch: {
        renameTitle: "Naam van ‘{name}’ wijzigen",
        renameDescription:
            "Voer de naam in die je in plaats daarvan wilt weergeven:",
        save: "Opslaan",
        renameCurrent: "Naam wijzigen: ‘{name}’",
        setCustomName: "Aangepaste naam instellen…",
        options: "Opties",
        sortLabel: "Bibliotheek sorteren op aangepaste naam",
        sortDescription:
            "Stelt het sorteerveld van Steam in wanneer je een game hernoemt. Schakel dit uit om de sorteervolgorde van de bibliotheek niet meer te beïnvloeden.",
        yourRenames: "Je naamswijzigingen ({count})",
        noCustomNames:
            "Nog geen aangepaste namen — klik met de rechtermuisknop op een game en kies ‘Aangepaste naam instellen…’.",
    },
    norwegian: {
        renameTitle: "Gi «{name}» nytt navn",
        renameDescription: "Skriv inn navnet du vil vise i stedet:",
        save: "Lagre",
        renameCurrent: "Gi nytt navn: «{name}»",
        setCustomName: "Angi egendefinert navn…",
        options: "Alternativer",
        sortLabel: "Sorter biblioteket etter egendefinert navn",
        sortDescription:
            "Angir Steams sorteringsfelt når du gir et spill nytt navn. Slå av for ikke lenger å påvirke sorteringsrekkefølgen i biblioteket.",
        yourRenames: "Dine navneendringer ({count})",
        noCustomNames:
            "Ingen egendefinerte navn ennå — høyreklikk på et spill og velg «Angi egendefinert navn…».",
    },
    polish: {
        renameTitle: "Zmień nazwę „{name}”",
        renameDescription:
            "Wprowadź nazwę, która ma być wyświetlana zamiast obecnej:",
        save: "Zapisz",
        renameCurrent: "Zmień nazwę: „{name}”",
        setCustomName: "Ustaw własną nazwę…",
        options: "Opcje",
        sortLabel: "Sortuj bibliotekę według własnej nazwy",
        sortDescription:
            "Ustawia pole sortowania Steam po zmianie nazwy gry. Wyłącz, aby nie wpływać na kolejność sortowania biblioteki.",
        yourRenames: "Twoje zmiany nazw ({count})",
        noCustomNames:
            "Brak własnych nazw — kliknij grę prawym przyciskiem myszy i wybierz „Ustaw własną nazwę…”.",
    },
    portuguese: {
        renameTitle: "Mudar o nome de «{name}»",
        renameDescription:
            "Introduza o nome que pretende apresentar em alternativa:",
        save: "Guardar",
        renameCurrent: "Mudar nome: «{name}»",
        setCustomName: "Definir nome personalizado…",
        options: "Opções",
        sortLabel: "Ordenar biblioteca por nome personalizado",
        sortDescription:
            "Define o campo de ordenação do Steam ao mudar o nome de um jogo. Desative para deixar de afetar a ordem da biblioteca.",
        yourRenames: "As suas alterações de nome ({count})",
        noCustomNames:
            "Ainda não existem nomes personalizados — clique com o botão direito num jogo e escolha «Definir nome personalizado…».",
    },
    brazilian: {
        renameTitle: "Renomear “{name}”",
        renameDescription: "Digite o nome que você deseja exibir no lugar:",
        save: "Salvar",
        renameCurrent: "Renomear: “{name}”",
        setCustomName: "Definir nome personalizado…",
        options: "Opções",
        sortLabel: "Ordenar biblioteca por nome personalizado",
        sortDescription:
            "Define o campo de ordenação do Steam ao renomear um jogo. Desative para não afetar mais a ordem da biblioteca.",
        yourRenames: "Seus jogos renomeados ({count})",
        noCustomNames:
            "Nenhum nome personalizado ainda — clique com o botão direito em um jogo e escolha “Definir nome personalizado…”.",
    },
    romanian: {
        renameTitle: "Redenumește „{name}”",
        renameDescription:
            "Introdu numele pe care dorești să-l afișezi în schimb:",
        save: "Salvează",
        renameCurrent: "Redenumește: „{name}”",
        setCustomName: "Setează un nume personalizat…",
        options: "Opțiuni",
        sortLabel: "Sortează biblioteca după numele personalizat",
        sortDescription:
            "Setează câmpul de sortare Steam când redenumești un joc. Dezactivează pentru a nu mai afecta ordinea bibliotecii.",
        yourRenames: "Redenumirile tale ({count})",
        noCustomNames:
            "Nu există încă nume personalizate — fă clic dreapta pe un joc și alege „Setează un nume personalizat…”.",
    },
    russian: {
        renameTitle: "Переименовать «{name}»",
        renameDescription:
            "Введите имя, которое будет отображаться вместо текущего:",
        save: "Сохранить",
        renameCurrent: "Переименовать: «{name}»",
        setCustomName: "Задать своё имя…",
        options: "Параметры",
        sortLabel: "Сортировать библиотеку по своему имени",
        sortDescription:
            "При переименовании игры задаёт поле сортировки Steam. Отключите, чтобы не влиять на порядок в библиотеке.",
        yourRenames: "Ваши переименования ({count})",
        noCustomNames:
            "Пока нет заданных имён — нажмите правой кнопкой мыши на игру и выберите «Задать своё имя…».",
    },
    finnish: {
        renameTitle: "Nimeä „{name}” uudelleen",
        renameDescription: "Anna nimi, jonka haluat näyttää sen sijaan:",
        save: "Tallenna",
        renameCurrent: "Nimeä uudelleen: „{name}”",
        setCustomName: "Aseta mukautettu nimi…",
        options: "Asetukset",
        sortLabel: "Lajittele kirjasto mukautetun nimen mukaan",
        sortDescription:
            "Asettaa Steamin lajittelukentän, kun nimeät pelin uudelleen. Poista käytöstä, jotta kirjaston lajittelujärjestykseen ei enää vaikuteta.",
        yourRenames: "Uudelleennimeämisesi ({count})",
        noCustomNames:
            "Ei vielä mukautettuja nimiä — napsauta peliä hiiren kakkospainikkeella ja valitse „Aseta mukautettu nimi…”.",
    },
    swedish: {
        renameTitle: "Byt namn på ”{name}”",
        renameDescription: "Ange namnet som du vill visa i stället:",
        save: "Spara",
        renameCurrent: "Byt namn: ”{name}”",
        setCustomName: "Ange anpassat namn…",
        options: "Alternativ",
        sortLabel: "Sortera biblioteket efter anpassat namn",
        sortDescription:
            "Anger Steams sorteringsfält när du byter namn på ett spel. Stäng av för att inte längre påverka bibliotekets sorteringsordning.",
        yourRenames: "Dina namnbyten ({count})",
        noCustomNames:
            "Inga anpassade namn ännu — högerklicka på ett spel och välj ”Ange anpassat namn…”.",
    },
    turkish: {
        renameTitle: "“{name}” oyununu yeniden adlandır",
        renameDescription: "Bunun yerine görüntülemek istediğiniz adı girin:",
        save: "Kaydet",
        renameCurrent: "Yeniden adlandır: “{name}”",
        setCustomName: "Özel ad belirle…",
        options: "Seçenekler",
        sortLabel: "Kütüphaneyi özel ada göre sırala",
        sortDescription:
            "Bir oyunu yeniden adlandırdığınızda Steam’in sıralama alanını ayarlar. Kütüphane sırasını etkilememesi için kapatın.",
        yourRenames: "Yeniden adlandırmalarınız ({count})",
        noCustomNames:
            "Henüz özel ad yok — bir oyuna sağ tıklayın ve “Özel ad belirle…” seçeneğini seçin.",
    },
    vietnamese: {
        renameTitle: "Đổi tên “{name}”",
        renameDescription: "Nhập tên bạn muốn hiển thị thay thế:",
        save: "Lưu",
        renameCurrent: "Đổi tên: “{name}”",
        setCustomName: "Đặt tên tùy chỉnh…",
        options: "Tùy chọn",
        sortLabel: "Sắp xếp thư viện theo tên tùy chỉnh",
        sortDescription:
            "Đặt trường sắp xếp của Steam khi bạn đổi tên trò chơi. Tắt để không còn ảnh hưởng đến thứ tự thư viện.",
        yourRenames: "Các tên bạn đã đổi ({count})",
        noCustomNames:
            "Chưa có tên tùy chỉnh — nhấp chuột phải vào trò chơi và chọn “Đặt tên tùy chỉnh…”.",
    },
    ukrainian: {
        renameTitle: "Перейменувати «{name}»",
        renameDescription: "Введіть назву, яку слід відображати натомість:",
        save: "Зберегти",
        renameCurrent: "Перейменувати: «{name}»",
        setCustomName: "Задати власну назву…",
        options: "Параметри",
        sortLabel: "Сортувати бібліотеку за власною назвою",
        sortDescription:
            "Задає поле сортування Steam під час перейменування гри. Вимкніть, щоб більше не впливати на порядок у бібліотеці.",
        yourRenames: "Ваші перейменування ({count})",
        noCustomNames:
            "Власних назв ще немає — клацніть гру правою кнопкою миші та виберіть «Задати власну назву…».",
    },
    malay: {
        renameTitle: 'Namakan semula "{name}"',
        renameDescription:
            "Masukkan nama yang anda mahu paparkan sebagai ganti:",
        save: "Simpan",
        renameCurrent: 'Namakan semula: "{name}"',
        setCustomName: "Tetapkan nama tersuai…",
        options: "Pilihan",
        sortLabel: "Isih pustaka mengikut nama tersuai",
        sortDescription:
            "Menetapkan medan isihan Steam apabila anda menamakan semula permainan. Matikan untuk berhenti mempengaruhi susunan pustaka.",
        yourRenames: "Nama yang anda ubah ({count})",
        noCustomNames:
            "Belum ada nama tersuai — klik kanan permainan dan pilih “Tetapkan nama tersuai…” untuk menambah satu.",
    },
};

let currentStrings = translations.english;

function normalizeLanguage(value: unknown): string {
    const raw = String(value || "english").toLowerCase();
    if (translations[raw]) return raw;
    const base = raw.split(/[-_]/)[0];
    return (
        (
            {
                zh:
                    raw.includes("tw") ||
                    raw.includes("hk") ||
                    raw.includes("hant")
                        ? "tchinese"
                        : "schinese",
                ja: "japanese",
                ko: "koreana",
                th: "thai",
                bg: "bulgarian",
                cs: "czech",
                da: "danish",
                de: "german",
                en: "english",
                es: "spanish",
                el: "greek",
                fr: "french",
                id: "indonesian",
                ms: "malay",
                it: "italian",
                hu: "hungarian",
                nl: "dutch",
                no: "norwegian",
                nb: "norwegian",
                pl: "polish",
                pt: raw.includes("br") ? "brazilian" : "portuguese",
                ro: "romanian",
                ru: "russian",
                fi: "finnish",
                sv: "swedish",
                tr: "turkish",
                vi: "vietnamese",
                uk: "ukrainian",
            } as Record<string, string>
        )[base] || "english"
    );
}

export async function initializeLocale(): Promise<void> {
    let language: unknown =
        document.documentElement.lang || navigator.language || "english";
    try {
        language = await SteamClient.Settings.GetCurrentLanguage();
    } catch {
        // Keep the browser-language fallback when the Steam API is unavailable.
    }
    currentStrings =
        translations[normalizeLanguage(language)] || translations.english;
}

export function strings(): LocaleStrings {
    return currentStrings;
}

export function format(
    template: string,
    values: Record<string, string | number>,
): string {
    return template.replace(/\{(\w+)\}/g, (match, key) =>
        String(values[key] ?? match),
    );
}
