const isEmpty = (string) => {
  if (string.trim() === '') return true
  else return false
}

exports.validateLoginData = (data) => {
  let errors = {}

  if (isEmpty(data.email)) throw new Error('email cannot be empty')
  if (isEmpty(data.password)) throw new Error('password cannot be empty')

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  }
}

const isEmail = (email) => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (email.match(emailRegEx)) return true
  else return false
}

exports.validateSignUpData = (data) => {
  let errors = {}

  if (isEmpty(data.email)) {
    errors.email = 'Must not be empty'
  } else if (!isEmail(data.email)) {
    throw new Error('Must be a valid email address')
  }

  if (isEmpty(data.password)) throw new Error('password must not be empty')
  if (isEmpty(data.username)) throw new Error(' cannot be empty')
  if (isEmpty(data.firstname)) throw new Error(' first name cannot be empty')
  if (isEmpty(data.lastname)) throw new Error('last name cannot be empty')
  if (isEmpty(data.idnumber)) throw new Error('id number  cannot be empty')
  if (isEmpty(data.phonenumber))
    throw new Error(' phone number cannot be empty')
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  }
}
