export default class Formatting {
  constructor() {}

  public static formatNumberWithDots(number: number) {
    // formatting number dengan . per 3 angka > 4
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

}
