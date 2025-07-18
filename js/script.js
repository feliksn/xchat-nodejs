window.addEventListener('load', function () {

    console.log('Страница готова!')
    console.log("script.js подключен")

/*  ------------------------------------------------------------------------------------------------- */
    const mass_accounts = [
        { "name": "Ronldo", "status": 0, "pic": "./img/profile.png" },
        { "name": "Zidane", "status": 1, "pic": "./img/profile.png" },
        { "name": "R. Carlos", "status": 0, "pic": "./img/profile.png" },
        { "name": "Romario", "status": 0, "pic": "./img/profile.png" },
        { "name": "Batistyta", "status": 0, "pic": "./img/profile.png" },
        { "name": "Davids", "status": 1, "pic": "./img/profile.png" },
        { "name": "P. Kluvert", "status": 0, "pic": "./img/profile.png" },
        { "name": "Vieri", "status": 0, "pic": "./img/profile.png" },
        { "name": "Shevchenko", "status": 0, "pic": "./img/profile.png" },
        { "name": "Rebrov", "status": 0, "pic": "./img/profile.png" },
        { "name": "Simeone", "status": 0, "pic": "./img/profile.png" },
        { "name": "Veron", "status": 1, "pic": "./img/profile.png" },
        { "name": "Crespo", "status": 0, "pic": "./img/profile.png" }
    ];

    mass_accounts.sort((a,b) => b.status - a.status);

    for (let i = 0; i < mass_accounts.length; i++) {
        const name = mass_accounts[i].name;
        const pic = mass_accounts[i].pic
        const status = mass_accounts[i].status == 0 ? "Offline" : "Online";
        const color_status = mass_accounts[i].status == 0 ? "warning" : "light";

        document.querySelector('.section-accounts').innerHTML += `
            <div class="account">
                    <div>
                        <img src=${pic} class="rounded-circle mx-2" width="40" alt="...">
                    </div>
                    <div>
                        <h5 class="text-light">${name}</h5>
                        <small class="text-${color_status}"><b>${status}</b></small>
                    </div>
            </div>
        `;
    }

    /*  --------------------------------------------------------------------------------------------  */

    const section_left = document.querySelector('.section-left');
    const section_right = document.querySelector('.section-right');
    const BTN_SECTION_RIGHT_HIDE = document.querySelector('.btn-exit-rigth-section');

    function sectionRightHideSectionLeftShow() {
        section_right.classList.replace('section-right-show', 'section-right-hide');
        section_left.classList.replace('section-left-hide', 'section-left-show');
    };

    function sectionRightShowLeftHide() {
        section_left.classList.replace('section-left-show', 'section-left-hide');
        section_right.classList.replace('section-right-hide', 'section-right-show');
    };

    // кнопка (стрелка влево возле имени в правой секции) вызывает функцию: прячет правую секцию
    BTN_SECTION_RIGHT_HIDE.addEventListener('click', () => {
        sectionRightHideSectionLeftShow()
    })

    //при изменении размера экрана срабатывает функция
    window.addEventListener('resize', function () {
        if (window.innerWidth < 769) {
            sectionRightHideSectionLeftShow();
        }
    })

    const accounts_sections = document.querySelector('.section-accounts');
    let last_clicked_account = null;

    if (accounts_sections !== null) {
        accounts_sections.addEventListener('click', function (event) {
            const account = event.target.closest('.account');
            console.log(account)
            document.querySelector('.section-header-right-account').innerHTML = account.innerHTML;
            if (last_clicked_account) {
                last_clicked_account.classList.remove('active-account')
            }
            account.classList.add('active-account');
            last_clicked_account = event.target.closest('.account');
            if (window.innerWidth < 769) {
                sectionRightShowLeftHide();
                return
            }
            section_right.classList.replace('section-right-hide', 'section-right-show');
        })
    }

})

