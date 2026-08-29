// =====================================
// PKV EAST CHIT
// COMMON MENU FOR ALL PAGES
// =====================================


document.addEventListener("DOMContentLoaded", function () {

    const menuContainer =
        document.getElementById("appMenu");

    if (!menuContainer) return;


    // =====================================
    // CURRENT PAGE
    // =====================================

    const currentPage =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    // =====================================
    // MENU HTML
    // =====================================

    menuContainer.innerHTML = `

        <!-- MOBILE BUTTON -->

        <button
            class="menu-toggle"
            id="menuToggle">

            ☰

        </button>


        <!-- OVERLAY -->

        <div
            class="menu-overlay"
            id="menuOverlay">
        </div>


        <!-- SIDEBAR -->

        <aside
            class="app-sidebar"
            id="appSidebar">


            <!-- HEADER -->

            <div class="app-sidebar-header">

                <h4>
                    💰 PKV EAST CHIT
                </h4>

                <small>
                    Chit Account Manager
                </small>

            </div>


            <!-- MENU -->

            <div class="app-menu">


                <!-- DASHBOARD -->

                <a
                    href="dashboard.html"
                    data-page="dashboard.html">

                    <span class="menu-icon">
                        🏠
                    </span>

                    <span>
                        Dashboard
                    </span>

                </a>


                <!-- GROUPS -->

                <a
                    href="groups.html"
                    data-page="groups.html">

                    <span class="menu-icon">
                        👥
                    </span>

                    <span>
                        Groups
                    </span>

                </a>


                <!-- MEMBERS -->

                <a
                    href="members.html"
                    data-page="members.html">

                    <span class="menu-icon">
                        👤
                    </span>

                    <span>
                        Members
                    </span>

                </a>


                <!-- WITNESS -->

                <a
                    href="witness.html"
                    data-page="witness.html">

                    <span class="menu-icon">
                        👥
                    </span>

                    <span>
                        Witness
                    </span>

                </a>


                <!-- INSTALLMENTS -->

                <a
                    href="installments.html"
                    data-page="installments.html">

                    <span class="menu-icon">
                        💰
                    </span>

                    <span>
                        Installments
                    </span>

                </a>


                <!-- COLLECTION -->

                <a
                    href="collection.html"
                    data-page="collection.html">

                    <span class="menu-icon">
                        💵
                    </span>

                    <span>
                        Collection
                    </span>

                </a>


                <!-- COMMISSION -->

                <a
                    href="commission.html"
                    data-page="commission.html">

                    <span class="menu-icon">
                        💵
                    </span>

                    <span>
                        Commission
                    </span>

                </a>


                <!-- EXPENSES -->

                <a
                    href="expenses.html"
                    data-page="expenses.html">

                    <span class="menu-icon">
                        💸
                    </span>

                    <span>
                        Expenses
                    </span>

                </a>


                <!-- REPORTS -->

                <a
                    href="reports.html"
                    data-page="reports.html">

                    <span class="menu-icon">
                        📊
                    </span>

                    <span>
                        Reports
                    </span>

                </a>


                <!-- FINAL REPORT -->

                <a
                    href="final-reports.html"
                    data-page="final-reports.html">

                    <span class="menu-icon">
                        📈
                    </span>

                    <span>
                        Final Reports
                    </span>

                </a>


                <!-- LOGOUT -->

                <div class="menu-logout">

                    <a
                        href="#"
                        id="menuLogout">

                        <span class="menu-icon">
                            🚪
                        </span>

                        <span>
                            Logout
                        </span>

                    </a>

                </div>


            </div>


        </aside>

    `;


    // =====================================
    // ACTIVE MENU
    // =====================================

    const menuItems =
        document.querySelectorAll(
            ".app-menu a[data-page]"
        );


    menuItems.forEach(item => {

        const page =
            item.getAttribute("data-page");

        if (page === currentPage) {

            item.classList.add("active");

        }

    });


    // =====================================
    // MOBILE MENU
    // =====================================

    const toggle =
        document.getElementById("menuToggle");

    const sidebar =
        document.getElementById("appSidebar");

    const overlay =
        document.getElementById("menuOverlay");


    if (toggle) {

        toggle.addEventListener(
            "click",
            function () {

                sidebar.classList.toggle("show");

                overlay.classList.toggle("show");

            }
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            function () {

                sidebar.classList.remove("show");

                overlay.classList.remove("show");

            }
        );

    }


    // =====================================
    // LOGOUT
    // =====================================

    const logout =
        document.getElementById("menuLogout");


    if (logout) {

        logout.addEventListener(
            "click",
            function (e) {

                e.preventDefault();


                const confirmLogout =
                    confirm(
                        "Do you want to logout?"
                    );


                if (!confirmLogout) {

                    return;

                }


                localStorage.removeItem(
                    "adminLogin"
                );


                window.location.href =
                    "login.html";

            }
        );

    }

});