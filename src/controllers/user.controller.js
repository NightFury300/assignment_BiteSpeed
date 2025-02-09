import { Contact } from "../models/contact.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const linkContacts = asyncHandler(async (req,res) => {
    const { email, phoneNumber } = req.body;

    if(!email && !phoneNumber){
      throw new APIError(400,"Either Email or Phone Number must be provided.");
    }
  
      let existingContacts = [];
      if(email){
        existingContacts = await Contact.findAll({
          where: {
            email,
          },
        });
      }
      if(phoneNumber){
        const phoneContacts = await Contact.findAll({
          where: {
            phoneNumber,
          },
        });
        existingContacts = [...existingContacts, ...phoneContacts];
      }
      
      if(existingContacts.length === 0){
        const newContact = await Contact.create({
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: null,
          linkPrecedence: 'primary',
        });
  
        return res.status(200).json(new APIResponse(200,{
          contact: {
            primaryContactId: newContact.id,
            emails: email ? [email] : [],
            phoneNumbers: phoneNumber ? [phoneNumber] : [],
            secondaryContactIds: [],
          },
        },"Contact Created Successfully"));
      }
  
      const primaryContact = existingContacts.sort((a, b) => a.createdAt - b.createdAt)[0];
      const secondaryContacts = existingContacts.filter(contact => contact.id !== primaryContact.id);

      const emails = [primaryContact.email, ...secondaryContacts.map(contact => contact.email)]
      .filter(e => e)
      .filter((value, index, self) => self.indexOf(value) === index);


      const phoneNumbers = [primaryContact.phoneNumber, ...secondaryContacts.map(contact => contact.phoneNumber)]
      .filter(p => p)
      .filter((value, index, self) => self.indexOf(value) === index);

      if((email && primaryContact.email !== email) || 
        (phoneNumber && primaryContact.phoneNumber !== phoneNumber)){
        await Contact.create({
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary',
        });
      }

    const result = {
      primaryContactId: primaryContact.id,
      emails,
      phoneNumbers,
      secondaryContactIds: secondaryContacts.map(contact => contact.id),
    };
  
    return res.status(200).json(new APIResponse(200,{ contact: result },"Links Fetched Successfully."));
});

export {linkContacts}