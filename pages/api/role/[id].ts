import { NextApiRequest, NextApiResponse } from 'next';
import knex from 'knex';
import knexConfig from '../../../knexfile';
import { StatusCode } from "@/lib/statusCodes";
import { transformResponse } from "@/lib/interceptors/transformInterceptor";

const db = knex(knexConfig);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  switch (method) {
    case 'GET':
      try {
        const role = await db('roles').where({ id }).first();
        
        if (!role) {
          return res.status(StatusCode.NOT_FOUND).json(transformResponse({
            data: null,
            message: 'Role not found',
            statusCode: StatusCode.NOT_FOUND
          }));
        }

        res.status(StatusCode.OK).json(transformResponse({
          data: role,
          message: 'Role retrieved successfully',
          statusCode: StatusCode.OK
        }));
      } catch (error) {
        console.error(error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
          data: null,
          message: 'Error fetching role',
          statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
      }
      break;

    case 'PUT':
      try {
        const { name, description, status } = req.body;

        const existingRole = await db('roles').where({ id }).first();
        if (!existingRole) {
          return res.status(StatusCode.NOT_FOUND).json(transformResponse({
            data: null,
            message: 'Role not found',
            statusCode: StatusCode.NOT_FOUND
          }));
        }

        await db('roles').where({ id }).update({
          name,
          description,
          status,
          updated_at: new Date()
        });

        const updatedRole = await db('roles').where({ id }).first();

        res.status(StatusCode.OK).json(transformResponse({
          data: updatedRole,
          message: 'Role updated successfully',
          statusCode: StatusCode.OK
        }));
      } catch (error) {
        console.error(error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json(transformResponse({
          data: null,
          message: 'Error updating role',
          statusCode: StatusCode.INTERNAL_SERVER_ERROR
        }));
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(StatusCode.METHOD_NOT_ALLOWED).end(`Method ${method} Not Allowed`);
  }
}
