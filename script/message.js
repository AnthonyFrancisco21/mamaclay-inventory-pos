document.addEventListener('DOMContentLoaded', function() {

    loadScript();
    loadData();



})


async function loadData(){
    let pageSize = 15;
    const messagesData = await getMessages(page = 1);
    console.log(messagesData)

    if(messagesData.total < pageSize){
        document.querySelector("a[data-page='next']").parentElement.classList.toggle("disabled");
    }

}


async function loadScript(){

    let currentPage = 1;
    let pageSize = 15;

    document.querySelector("a[data-page='prev']").parentElement.classList.toggle("disabled");

    document.querySelector(".msg-pagination").addEventListener('click', async (e) =>{

        const target = e.target.closest("a[data-page]");
        if (!target) return;
        
        const action = target.dataset.page;

        if(action === 'prev' && currentPage > 1){
            currentPage--;
            console.log(currentPage);
        }else if(action === 'next'){
            currentPage++;
            console.log(currentPage);
        }

        const res = await getMessages(currentPage);
        
         if (res) {
            
            const totalRows = res.total;
            const totalPages = Math.ceil(totalRows / res.pageSize); 
            
            // disable buttons
            document.querySelector("a[data-page='prev']").parentElement.classList.toggle("disabled", currentPage === 1);
            document.querySelector("a[data-page='next']").parentElement.classList.toggle("disabled",currentPage >= totalPages);
            
        };


    })


}


async function getMessages(currentPage){

    try{

        const res = await fetch(`./backend/getMessages.php?page=${currentPage}`);
        const result = await res.json();

        table(result.messages)

        return result;
        

    }catch(err){
        console.log(err);
    }

}

async function table(messages){
    const table = document.querySelector('.message-tbody');

    if (!messages) {
        table.innerHTML = `<tr><td colspan="6" class="text-center">Loading...</td></tr>`;
        return;
    }

    let tableHTML = "";
    if(messages.length === 0){
        table.innerHTML = "<tr><td class='no-data' colspan='6'> No data </td></tr>";
    }
    else{
        messages.forEach((msg) => {
            tableHTML += `
                <tr class="tr-tag">
                    <td class="email">
                        <span><input type="checkbox" class="check"></span>
                        
                        <span>${msg.client_email}</span>
                    </td>
                    
                    <td class="subject">${msg.subject}</td>
                    <td class="message">${msg.message}</td>
                    <td class="time">${msg.message_date}</td>

                </tr>
            `;
                
            table.innerHTML = tableHTML;
            
        });

        
    }
}