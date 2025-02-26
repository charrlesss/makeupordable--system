export function isValidDate(dateString) {
    // Ensure the date is in the correct format: YYYY-MM-DD
     const regex = /^\d{4}-\d{2}-\d{2}$/;
     if (!regex.test(dateString)) {
         return false;
     }
 
     // Extract the year, month, and day
     const [year, month, day] = dateString.split("-");
 
     // Ensure year is a valid four-digit number and within a reasonable range
     const parsedYear = parseInt(year);
     if (parsedYear < 1000 || parsedYear > 2040) {
         return false;
     }
 
     const date = new Date(dateString);
     // Ensure the created date matches the parts we input, adjusting for overflow
     return date.getFullYear() === parsedYear &&
            date.getMonth() + 1 === parseInt(month) &&
            date.getDate() === parseInt(day);
 }