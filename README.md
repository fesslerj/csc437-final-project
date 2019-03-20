**Radical Restaurant Reviews REST Service**

Copyright 2019, Ethan Kusters and Jonathan Fessler

Adapted from [Chat REST Service](http://users.csc.calpoly.edu/~grade-cstaley/WebDev/Modules/03NodeJS/0CHSREST/CHSREST.html) by Clint Staley

**Overview**

The Radical Restaurant Reviews REST Service (R<sup>3</sup>RS) provides the interface needed to interact with a site that tracks users, restaurants, and reviews posted to those restaurants. The site tracks many different restaurant, and any user may make a post to any restaurant, see other user's reviews, etc.

**General Points**

The following design points apply across the document.



1. All resource URLs are prefixed by some root URL, (e.g. http://www.example.com/RRR/)
2. All resources accept and provide only JSON body content. And per REST standards, all successful (200 code) DELETE actions return an empty body.
3. Some GET operations allow get-parameters. These are listed directly after the GET word. All get-parameters are optional unless given in bold.
4. Absent documentation to the contrary, all DELETE calls, POST, and PUT calls with a non-200 HTTP response return as their body content, a list of JSON objects describing any errors that occured. Error objects are of form {tag: {errorTag}, params: {params}} where errorTag is a string tag identifying the error, and params is an array of additional values needed to fill in details about the error, or is null if no values are needed. E.g. {tag: "missingField", params: ["lastName"]}
5. Resource documentation lists possible errors only when the error is not obvious from this General Points section. Relevant errors may appear in any order in the body. Missing field errors are checked first, and no further errors are reported if missing fields are found.
6. All resource-creating POST calls return the newly created resource as a URI via the Location response header, not in the response body. The response body for such POSTs is reserved for error information, per point 4.
7. GET calls return one of the following. Response body is empty in the latter three cases. Get calls whose specified information is a list always return an array, even if it has just one or even zero elements.
    1. HTTP code 200 **OK** and the specified information in the body.
    2. **BAD_REQUEST **and a list of error strings.
    3. **UNAUTHORIZED **for missing login.
    4. **FORBIDDEN **for insufficient authorization despite login
    5. **NOT_FOUND **for a URI that is not described in the REST spec if logged in, 401 if not. 
8. Fields of JSON content for POST and PUT calls are assumed to be strings, booleans, ints, or doubles without further documentation where obvious by their name or intent. In non obvious cases, the docs give the type explicitly.
9. **Not all** access does require authentication via login to establish the Authenticated User (AU); all resources are **public** _except _for the list of private resources below (9a and on). Some of these non-public resources may be further restricted based on admin status of AU. The default restriction is to allow access to all public resources to anyone, plus to allow access relevant to the AU, unless the AU is admin, in which case access to any Person's info is allowed.
    6. GET Ssns [admin only]
    7. POST Rsts
    8. PUT Rsts/{id}
    9. DELETE Rsts/{id}
    10. POST Rsts/{id}/Revs
    11. POST Revs/{id}
    12. POST Vots/{rstId}/{revId}
    13. DELETE DB [admin only]
10. Any database query failure constitutes a server error (HTTP status 500 **INTERNAL_SERVER_ERROR**) with a body giving the error object returned from the query. Ideally, no request, however badly framed, should result in such an error except as described in point 11
11. The REST interface does no general checking for _forbiddenField_ errors, unless the spec specifically indicates it will. Absent such checking, non-specified body fields in PUT/POST calls may result in database query errors and an HTTP code 500 **INTERNAL_SERVER_ERROR**, as may an empty body when body content is expected.
12. Required fields may not be passed as **null**, **undefined** or **""**. Doing so has the same outcome as if the field were entirely missing.
13. All times are integer values, in mS since epoch.
14. Non JSON parseable bodies result in an HTTP code 500 **INTERNAL_SERVER_ERROR**.



**Error Codes**

The possible error codes, and any parameters, are as follows. An asterisk (*) before the description indicates that params[0] gives the field name for the offending value.


<table>
  <tr>
   <td><em>missingField</em>
   </td>
   <td>*
   </td>
   <td>Field missing from request
   </td>
  </tr>
  <tr>
   <td><em>badValue</em>
   </td>
   <td>*
   </td>
   <td>Field has bad value
   </td>
  </tr>
  <tr>
   <td><em>notFound</em>
   </td>
   <td>
   </td>
   <td>Entity not present in DB – for cases where a Restaurant, Person, etc. is not there
   </td>
  </tr>
  <tr>
   <td><em>badLogin</em>
   </td>
   <td>
   </td>
   <td>Email/password combination is invalid, for error logging
   </td>
  </tr>
  <tr>
   <td><em>dupEmail</em>
   </td>
   <td>
   </td>
   <td>Email duplicates an existing email
   </td>
  </tr>
  <tr>
   <td><em>noTerms</em>
   </td>
   <td>
   </td>
   <td>Acceptance of terms is required
   </td>
  </tr>
  <tr>
   <td><em>noOldPwd</em>
   </td>
   <td>
   </td>
   <td>Change of password requires an old password
   </td>
  </tr>
  <tr>
   <td><em>oldPwdMismatch</em>
   </td>
   <td>
   </td>
   <td>Old password that was provided is incorrect
   </td>
  </tr>
  <tr>
   <td><em>dupTitle</em>
   </td>
   <td>
   </td>
   <td>Restaurant title duplicates an existing one
   </td>
  </tr>
  <tr>
   <td><em>forbiddenField</em>
   </td>
   <td>*
   </td>
   <td>Field in body not allowed
   </td>
  </tr>
  <tr>
   <td><em>queryFailed</em>
   </td>
   <td>
   </td>
   <td>Query failed (server problem)
   </td>
  </tr>
</table>




**Resources for User Management, including Registration**

Unless otherwise specified (for example, by one of the below color codes), all resources are **public** (are visible to all AUs _and_ are also visible without logging in).

**(Admin use in purple)**


    **Indicates that the resource is only available to Admin AUs**

**(Non-public in blue)**


    **Indicates that the resource requires an AU.**

**<span style="text-decoration:underline;">Prss</span>**

Collection of all current users


    **_GET_** email={email or email prefix}


    Returns list of zero or more Persons. Limits response to Persons with specified email or email prefix, if applicable. No data for other than the AU is returned in any event, unless the AU is an admin. This may result in an empty list if e.g. a non-admin asks for an email not their own. Data per person:


        _email_ principal string identifier, unique across all Persons


        _id_ id of person with said email, so that URI would be Prss/{id}


    **_POST_**


    Adds a new Person. No AU required, as this resource/verb is used for registration, but an AU is allowed, and an admin AU gets special treatment as indicated.


        _email_ unique Email for new person, **required**, limited to 160 chars


        _firstName _limited to 50 chars


        _lastName **required**_, limited to 50 chars


        _password _limited to 50 chars


        _role_ 0 for standard user, 1 for admin, **required**


        _termsAccepted_ boolean--were site terms and conditions accepted?


        Email, role and lastName required and must be nonempty. Error if email is nonunique. Error if terms were not accepted and AU is not admin. Error forbiddenRole if role is not student unless AU is admin. Nonempty password required unless AU is admin, in which case if no password is provided a blocking password of * is recorded, preventing further access to the account (once encryption is enforced).



**<span style="text-decoration:underline;">Prss/{prsId}</span>**


    **_GET_**


    Returns array with one element for Person {prsId}, with fields as specified in POST for Prss, plus dates _termsAccepted_ and _whenRegistered_, less _password_. (_termsAccepted _may be falsey if terms were not accepted.) The dates give time of term acceptance and registration, and will generally be equal, but are listed separately for legal reasons. AU must be person {prsId} or admin.


    **_PUT_**


    Update Person {prsId}, with body giving an object with zero or more of _firstName_, _lastName_, _password_, _role. _Attempt to change other fields in Person such as _termsAccepted_ or _whenRegistered_ results in BAD_REQUEST and forbiddenField error(s). Role changes result in BAD_REQUEST with badValue tag for nonadmins. All changes require the AU be the Person in question, or an admin. Unless AU is admin, an additional field _oldPassword_ is required for changing _password, _with error oldPwdMismatch resulting if this is incorrect. Password, if supplied, must be nonempty and nonnull or badValue error results, even if AU is admin.


    **_DELETE_**


    Delete the Person in question, including all Rsts, Revs, and Vots owned by Person. Requires admin AU.

**<span style="text-decoration:underline;">Ssns</span>**

Login sessions (Ssns) establish an AU. A user obtains one via POST to Ssns.


    **_GET_**


    Returns a list of all active sessions. Admin-privileged AU required. Returns array of


        _cookie_ Unique cookie value for session


        _prsId_ ID of Person logged in


        _loginTime_ Date and time of login


    **_POST_**


    A successful POST generates a browser-session cookie that will permit continued access for 2 hours. Indicated Person becomes the AU. An unsuccessful POST results in a 400 with a badLogin tag and no further information.


        _email_ Email of user requesting login, **required**


        _password_ Password of user, **required**

**<span style="text-decoration:underline;">Ssns/{cookie}</span>**


    **_GET_**


    Returns, for the indicated session, a single object with same properties as one element of the array returned from Ssns GET. AU must be admin or owner of session.


    **_DELETE_**


    Log out the specified Session. AU must be owner of Session or admin.

**Resources for Restaurants**

The following resources allow creation, deletion, and management of Restaurants -- each a series of Reviews. Any user may GET information on any Restaurant or Review. Any AU may POST Reviews to any Restaurant and may POST an entirely new restaurant, thus becoming its owner. The owner of the Restaurant and Admin AUs may post comments on a Restaurant's reviews.

**<span style="text-decoration:underline;">Rsts</span>**


    **_GET _**owner=<ownerId>


    No login required. Return an array of 0 or more elements, with one element for each Restaurant in the system, limited to Restaurants with the specified owner if query param is given:


        _id_ Id of the Restaurant


        _title_ Title of the Restaurant


        _ownerId_ Owner of the Restaurant


        _url_ URL for the Restaurant.


    _category_ Category of the Restaurant. (see **POST Rsts** for a list of allowed values)


    _description_ Description of the restaurant


    _lastReview_ When the Restaurant was last reviewed


    **_POST_**


    Any AU is acceptable, though some login is required. Create a new Restaurant, owned by the current AU. Error dupTitle if title is a duplicate. Fields are:


        _title_ Title of the new Restaurant, limited to 80 chars, **required**


        _description_ Description of the new Restaurant, limited to 300 chars


        _url_ URL for the new Restaurant, limited to 80 chars, **required**


    _category_ Category of the new restaurant, **required**. Limited to one of the following:



*   Bakery
*   Barbeque
*   Chinese
*   Deli
*   Fine Dining
*   Ice Cream
*   Seafood
*   Vegetarian
*   Breakfast
*   Burgers
*   Coffee
*   Italian
*   Sandwiches
*   Pizza

**<span style="text-decoration:underline;">Rsts/{rstId}</span>**


    **_GET_**


    No login required. Return single object having same properties as one of the array elements returned by Rsts GET, for just the indicated Rst.


    **_PUT_**


    Update the title of the Restaurant. Fields as for Restaurants POST, including required title. Error dupTitle if title is duplicate. AU must be Restaurant owner or admin.


    **_DELETE_**


    Delete the Restaurant, including all associated Reviews and Votes. AU must be Restaurant owner or admin.

**<span style="text-decoration:underline;">Rsts/{rstId}/Revs</span>**


    **_GET_** dateTime ={dateTime} num={num}


    No login required. Return all Reviews for the indicated Restaurant. Limit this to at most num Reviews (if num is provided) posted on or before dateTime (if dateTime is provided). Return for each Review, in increasing datetime order, and for same datetimes, in increasing ID order:


        _id_ Review ID


        _firstName _First name of reviewer


        _lastName _Last name of reviewer


        _whenMade_ when the Review was made


        _email_ Email of the reviewer


        _content_ Content of the Review


        _title _Title of the Review


        _rating_ Rating value as an integer out of 5.


        _numUpvotes_ Number of upvotes. Could be negative.


        _ownerResponse_ Content of the owner's response, as follows (or could be null):


        	_whenMade_ When the response was made


        _	content_ Content of the response


    **_POST_**


    Any AU is acceptable, though some login is required. Add a new Review, stamped with the current AU and date/time. Number of upvotes will be set to zero.


    	_title_ Title of the review, limited to 80 chars


        _content_ Content of the Review, up to 5000 chars


        _rating_ Restaurant rating as an integer value out of 5.

**Resources for Reviews**

**<span style="text-decoration:underline;">Revs/{revId}</span>**


    **_GET_**


    No login required. Return the following for the indicated review.


    	_rstId_ the ID of the Restaurant for which the review was made


        _whenMade_ when the Review was made


        _firstName _First name of reviewer


        _lastName _Last name of reviewer


        _email_ Email of the poster


        _title _Title of the Review


        _content_ Content of the Review


        _rating_ Rating value as an integer out of 5.


        _numUpvotes_ Number of upvotes. Could be negative.


        _ownerResponse_ Content of the owner's response, as follows (or could be null):


        	_whenMade_ When the response was made


        _	content_ Content of the response


        	


    **_POST_**


    AU must be restaurant owner or an admin. Add an owner response to a review. Response is stamped with the current AU and date/time.


        _ownerResponse_ Content of the owner's response, up to 5000 chars.

**Resources for Review Votes**

**<span style="text-decoration:underline;">Vots/{rstId}/{revId}</span>**

**<span style="text-decoration:underline;">	_GET_</span>**


    Any AU is acceptable, though some login is required. Gets the user's current vote on a review. If the user has not voted on a review yet, returns tagged error _notFound_.


        _voteValue_ Value of the user's vote. Will be either -1 or 1, indicating an upvote or downvote (respectively).


    **_POST_**


    Any AU is acceptable, though some login is required. Add a user vote to a review. Vote is stamped with the current AU and date/time.


        _voteValue_ Value of user's vote. Must be 1 or -1, indicating an upvote or downvote (respectively).

	**_DELETE_**


    Any AU is acceptable, though some login is required. Delete a user's vote on a review. If a user does not have a vote on the review yet, the DELETE call returns error _notFound_.

**Special DB Resource for Testing Purposes**

**<span style="text-decoration:underline;">DB</span>**


    **_DELETE_**


    Clear all content from the database, reset all autoincrement IDs to 1, and add back one Person, an admin named Joe Admin with email adm@11.com and password "password". Clear all current sessions. AU must be an admin.
