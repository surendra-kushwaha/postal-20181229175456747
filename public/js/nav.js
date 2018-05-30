const navToggele= document.querySelector('.menu-button');

navToggele.addEventListener('click',()=>{
  document.body.classList.add('nav-is-open')
})

const navToggele2= document.querySelector('.close-button');

navToggele2.addEventListener('click',()=>{
  document.body.classList.remove('nav-is-open')
})
