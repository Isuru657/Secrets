# Secrets

This project is extremely close to my heart. The inspiration for this project was based on my fraternity. There was an effective means of discourse in the brotherhood- through a mandatory event, knowns as lock-in, the brothers would communicate any issues that concerned them by submitting their concerns on a google doc that would then be discussed.  However, as I sat through lock-in I had a few questions that remained unanswered-

_a) How many of the qualms submitted were actually discussed?_

It is important to know what subsets of qualms were brought to the attention of everyone. The selection of the qualms would reflect on the quality of leadership.

Similarly, I would like to know what qualms go unanswered. I could have overlooked an important issue that another brother may have noticed.

_b) What qualms are finally resolved?_

This would help me show if people make tangible actions to change status quo as they had initially agree DURING lock-in.

This project helps brothers solve both problems. Without going into too much detail right away, this project maintains a record of items that changes dynamically as participants add/remove qualms.

It also helps see how many qualms are resolved and what those qualms are.

I'll go over the structure of this project with the use of a case study to help get an understanding of how the project works.

## Contents
- Project structure
- Assumptions made
- Packages Required
- The Landing Page
- The Login/Register Page
- The Main Page
- Discussion Rooms
- Improvements

## Project structure

<img src= "/structure.png">

### The case study:
I have a problem about the level of noise in the house after 11:00pm because I have classes early in the morning. I decided to use this app hoping to discuss my concern with everyone living in the house and see if anyone else shares my sentiments.

## Assumptions made

- The user has a private email that makes no reference to his name or any other personal information in the handle. In this case study, I will use the handle anon@gmail.com. This allows for users to anonymously post any qualms freely (although  I will be the admin in this case).

- Users will not know the true identities of the participants the discussion room.


- The discussion room will have an overlying theme and any items to discuss on the agenda would be sub-problems of the issue.

- The password to the discussion room would be communicated through some secure means of the admin's choosing. This would vary based on individual contexts.

- This would mean that the admin will know who is in the discussion room, but will not be able to associate the username with the actual person.

- I will be using the phrase "delete issues" in the discussion room section. I mean to say that a sub-problem has been discussed by the admin of the group (I am in the admin in the case study as I create my discussion room).

- The discussion would happen physically. Once again, everyone would know who the participants are but no one can associate a participant with a specific username. A participant A could be a part of the discussion (possibly as a moderator or a bystander) and not contribute to adding items to discuss.

## Packages used

a) express.js: The package manages routing in the app and all client-server communication.

b) mongoose: This package will help connect to the remotely hosted database and help store and retrieve data pertaining to the project.

c) ejs: This will handle all front-end rendering as it allows html to be replicated when creating discussion rooms. It eliminates the need to manually code discussion rooms every time a new discussion room is created.

## The Landing page

<img src="/landingpg.png">

## The Register page

The first step is to create an account. Note that username field requires an email (any handle with @ in it). It will reject a username in any other format.

<img src="/register.png">

The User Schema (refer app.js) captures key information such as username and password.

_Password security_: The passwords have been encrypted using serialization.

Once I create an account, my username and password would be compared with existing documents in the database. If there is a match, I would have to enter different credentials. If there is no match, I am redirected to the main page where I can now create or join a discussion room.

Note that I also have the option of signing up with google here.

<img src="/main2.png">

## The Login page

I can now log out and see if my credentials have been saved.

<img src="/login.png">

Assuming that I registered myself under anon@gmail.com, I can now login in through this page. Once I click the log in button, my credentials are checked with the information in the database and if there is a match, I am redirected to the main page. If there is no match, I am presented with an unauthorized message.

Again, I am presented with the opportunity to sign in with google here.

## The Main Page

<img src="/main3.png">

I can create a discussion room with an id of my choosing now. For the sake of simplicity, I will call it _noise_.

I will also be the admin of this discussion room.

The moment I hit the create button, a post request will first check if there is a room with a similar id. If so, I am redirected to the main page again. If not, a new room is created.

The Room Schema (refer app.js) captures key information such as:
- the admin of the room
- the issues to be discussed
- the participants in the rooms

Recording the participants in the room makes sure that there is no unwanted access in the discussion room.

I am now redirected to the discussion room.

<img src="/discussion_room.png">

Note: The discussion room's link generated is unique because it incorporates the unique room Id. I was able to do this by taking advantage of express's ability to create custom route links.

## The Discussion Rooms

The main topic of the discussion room is "Noise". I'd like to be more specific and set the tone for the discussion so I'm going to submit an issue to discuss. I have a problem with room 25 playing hard trap music at  11:30 pm.

<img src="/complaint1.png">

As the admin, I can invite others to join the discussion room.

Another user, raptor@gmail.com, is about to join the discussion room too.

<img src="/raptormain.png">

Raptor claims that the music in the basement is too loud.

<img src="/rcomplaint1.png">

As time progresses, my qualm is resolved first as it is on the list. I can now delete this item and the number of issues covered will increase to 1.

At this point, I will know which qualm was picked, how many issues have been covered and how many issues remain. The entire process is transparent.

<img src="/deletec1.png">

<hr>
<img src="/deletec2.png">

Once all issues have been covered, I can go back to the main page and log out!

## Improvements
- The app has a relatively slow run time compared to when it is run on a local host. Enhancing the run times can make the user experience better.
- I believe that there should be a section for admins to refer back to the discussion rooms they've hosted to reflect on the issues discussed and to see if actual change has occurred.
- The styling has been imported from bootstrap. There is always room for improvement to enhance the quality of the the appearance of the web app.

<hr>

I hope you enjoyed reading through this project! Have a great day!
