const btn = document.getElementById("searchBtn");
const usernameInput = document.getElementById("userName");

const profileDiv = document.getElementById("profile");
const reposDiv = document.getElementById("repos");

const loadingText = document.getElementById("loading");
const errorText  = document.getElementById("error");

const battleBtn = document.getElementById("battleBtn");
const battleResult = document.getElementById("battleResult");

function formatDate(dateString){
    const date = new Date(dateString);
    return date.toDateString();
}

function createElement(tag, text){
   const el = document.createElement(tag);
  if(text)  el.textContent= text;
    return el;
}

async function getUser(userName) {
    try {
        showLoading(true);
        clearUI();
    const response = await fetch(`https://api.github.com/users/${userName}`);
      if(!response.ok){
        throw new Error ("User Not Found");
    }
    const data = await response.json();
    renderProfile(data);


   await getRepos(data.repos_url);

    } catch (error) {
        showError(error.message)
    }finally{
        showLoading(false);
    }
}

async function getRepos(url) {
    try {
        const response = await fetch(url);
        if(!response.ok){
            throw new Error("Failed to fetch repos");
        }
        const repos = await response.json();
        renderRepos(repos.slice(0,5));

    } catch (error) {
      console.log(error);
       showError("Failed to load repositories");
    }
}

async function battleUsers(user1, user2) {
   try {
     showLoading(true);
     clearUI();
     battleResult.innerHTML="";

     const [res1 ,res2] = await Promise.all([
        fetch(`https://api.github.com/users/${user1}`),
        fetch(`https://api.github.com/users/${user2}`)
     ]);

     if(!res1.ok || !res2.ok){
        throw new Error("One or both users not found");
     }
     const data1 =  await res1.json();
     const data2 =  await res2.json();

     const [repoRes1, repoRes2] = await Promise.all([
        fetch(data1.repos_url),
        fetch(data2.repos_url)
     ]);

     const repos1 = await repoRes1.json();
     const repos2 = await repoRes2.json();

     const star1 = calculateStars(repos1);
     const star2 = calculateStars(repos2);
     
     renderBattle(data1, star1, data2, star2);

   } catch (error) {
      showError(error.message);
   }   
   finally{
    showLoading(false);   
} 
}

function renderProfile(user){
    profileDiv.innerHTML="";
    const img = document.createElement("img");
    img.src = user.avatar_url;

    const name = createElement("h2", user.name || "No Name");
    const bio = createElement("p", user.bio ||"No Bio");
    const joined = createElement("p", "joined: " + formatDate(user.created_at));
    const link = createElement("a");
    link.href = user.html_url;
    link.target = "_blank";
    link.textContent = "Visit Profile";
    profileDiv.append(img,name,bio,joined,link);
}

function renderRepos(repos){
    reposDiv.textContent = "";

    const heading = createElement("h2" , "Top Repositories");
    reposDiv.appendChild(heading);
    
    repos.forEach(repo => {
        const a = document.createElement("a");
        a.href = repo.html_url;
        a.target = "_blank";
        a.textContent = repo.name;

        const div = document.createElement("div");
        div.classList.add("repo");
        div.appendChild(a);
        
        reposDiv.append(div);
    });
        
    }

function renderBattle(user1, star1, user2, star2){
  battleResult.textContent ="";

  function createCard(user, star, isWinner){
    const div = document.createElement("div");
    const name = createElement("h3", user.name ||user.login);
    const starText = createElement("p", "stars: " + star);

    div.append(name, starText);
     div.style.border = "2px solid";
     div.style.margin = "10px";
     div.style.padding = "10px";

      if(isWinner){
        div.style.borderColor = "green";
      }else{
        div.style.borderColor = "red";
      }
      return div;
 }

 if(star1 > star2){
    battleResult.append(
        createCard(user1, star1, true),
        createCard(user2, star2, false)
);
}
else if(star2 > star1){
    battleResult.append(
        createCard(user2, star2, true),
        createCard(user1, star1, false)
    );
}
else{
    const tieMsg = createElement("h3", "It's a Tie");
    battleResult.append(tieMsg);
}
}


function showLoading(show){
        loadingText.style.display = show? "block":"none";
    }

function showError(msg){
        errorText.textContent = msg;
    }

function clearUI(){
        profileDiv.innerHTML = "";
        reposDiv.innerHTML ="";
        errorText.textContent = "";
    }

function calculateStars(repos){
    return repos.reduce((total,repo)=>{
        return total + repo.stargazers_count;
    },0);
}

btn.addEventListener("click",()=>{
    const userName = usernameInput.value.trim();
    if(userName){
        getUser(userName);
    }
});

battleBtn.addEventListener("click", ()=>{
    const user1 = document.getElementById("user1").value.trim();
    const user2 = document.getElementById("user2").value.trim();
    if(user1&&user2){
       battleUsers(user1, user2);
    }
});


