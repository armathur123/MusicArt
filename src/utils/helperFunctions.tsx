
class HelperFunctions {

    capitalizeFirstLetter = (string: string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

}

const helperFunctions = new HelperFunctions();

export default helperFunctions;