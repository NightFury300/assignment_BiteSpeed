import { Contact } from "../models/contact.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const linkContacts = asyncHandler(async (req, res) => {
  const { email, phoneNumber } = req.body;

  if (!email && !phoneNumber) {
    throw new APIError(400, "Either Email or Phone Number must be provided.");
  }

  let existingContacts = [];
  if (email) {
    existingContacts = await Contact.findAll({
      where: { email },
    });
  }
  if (phoneNumber) {
    const phoneContacts = await Contact.findAll({
      where: { phoneNumber },
    });
    existingContacts = [...existingContacts, ...phoneContacts];
  }

  if (existingContacts.length === 0) {
    const newContact = await Contact.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId: null,
      linkPrecedence: 'primary',
    });

    return res.status(200).json(new APIResponse(200, {
      contact: {
        primaryContactId: newContact.id,
        emails: email ? [email] : [],
        phoneNumbers: phoneNumber ? [phoneNumber] : [],
        secondaryContactIds: [],
      },
    }, "Contact Created Successfully"));
  }

  const primaryContacts = existingContacts.filter(contact => contact.linkPrecedence === 'primary');

  if (primaryContacts.length > 1) {
    const sortedPrimaryContacts = primaryContacts.sort((a, b) => a.createdAt - b.createdAt);
    const newPrimaryContact = sortedPrimaryContacts[0];

    for (let i = 1; i < sortedPrimaryContacts.length; i++) {
      const contact = sortedPrimaryContacts[i];
      contact.linkPrecedence = 'secondary';
      contact.linkedId = newPrimaryContact.id;
      await contact.save();
    }

    existingContacts = existingContacts.map(contact => {
      if (contact.id === newPrimaryContact.id) return newPrimaryContact;
      return contact;
    });
  }

  const primaryContact = existingContacts.sort((a, b) => a.createdAt - b.createdAt)[0];

  const hasNewEmail = email && !existingContacts.some(contact => contact.email === email);
  const hasNewPhone = phoneNumber && !existingContacts.some(contact => contact.phoneNumber === phoneNumber);

  if (hasNewEmail || hasNewPhone) {
    await Contact.create({
      email: email || null,
      phoneNumber: phoneNumber || null,
      linkedId: primaryContact.id,
      linkPrecedence: 'secondary',
    });
  }

  const secondaryContactIds = await Contact.findAll({
    where: { linkedId: primaryContact.id },
  });

  const result = {
    primaryContactId: primaryContact.id,
    emails: [
      primaryContact.email,
      ...secondaryContactIds.map(contact => contact.email).filter(email => email)
    ].filter((value, index, self) => self.indexOf(value) === index),
    phoneNumbers: [
      primaryContact.phoneNumber,
      ...secondaryContactIds.map(contact => contact.phoneNumber).filter(number => number)
    ].filter((value, index, self) => self.indexOf(value) === index),
    secondaryContactIds: secondaryContactIds.map(contact => contact.id)
  };

  return res.status(200).json(new APIResponse(200, { contact: result }, "Links Fetched Successfully."));
});

export { linkContacts };